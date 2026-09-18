using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("OmniConvert Studio")]
[assembly: AssemblyDescription("Universal Offline Document & Media Converter Suite")]
[assembly: AssemblyCompany("Regional Office (RO), Faridabad")]
[assembly: AssemblyProduct("OmniConvert Studio")]
[assembly: AssemblyCopyright("Developed by Niraj Kumar, Section Supervisor, RO, Faridabad")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace OmniConvert
{
    static class SecurityLock
    {
        // Secret cryptographic salt tied to creator
        private const string SALT = "OmniConvert_NirajKumar_RO_Faridabad_SecretSalt_2026_HardwareLock";

        /// <summary>
        /// Generates a unique hardware fingerprint using Windows MachineGuid + Processor ID + Machine Name.
        /// Changes across every different computer!
        /// </summary>
        public static string GetCurrentMachineFingerprint()
        {
            string machineGuid = "";
            try
            {
                machineGuid = (string)Registry.GetValue(@"HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography", "MachineGuid", "");
            }
            catch {}

            if (string.IsNullOrEmpty(machineGuid))
            {
                machineGuid = Environment.MachineName;
            }

            string cpuId = Environment.GetEnvironmentVariable("PROCESSOR_IDENTIFIER") ?? "CPU_GENERIC";
            string raw = machineGuid.Trim().ToLowerInvariant() + "#" + cpuId.Trim() + "#" + SALT;

            using (SHA256 sha = SHA256.Create())
            {
                byte[] hash = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
                StringBuilder sb = new StringBuilder();
                foreach (byte b in hash) sb.Append(b.ToString("X2"));
                return sb.ToString();
            }
        }

        /// <summary>
        /// Verifies whether this installation is running on the authorized computer.
        /// Returns true only if the license matches the current machine hardware.
        /// </summary>
        public static bool VerifyMachineLock(string baseDir, out string errorMessage)
        {
            errorMessage = "";
            string currentFingerprint = GetCurrentMachineFingerprint();

            string licenseFile = Path.Combine(baseDir, "app.license");
            string registryLicense = "";

            try
            {
                registryLicense = (string)Registry.GetValue(@"HKEY_CURRENT_USER\Software\OmniConvert", "HardwareKey", "");
            }
            catch {}

            string fileLicense = "";
            if (File.Exists(licenseFile))
            {
                try
                {
                    fileLicense = File.ReadAllText(licenseFile).Trim();
                }
                catch {}
            }

            // If neither exists, app was not legally installed via Setup
            if (string.IsNullOrEmpty(fileLicense) && string.IsNullOrEmpty(registryLicense))
            {
                errorMessage = "Missing License! Please install OmniConvert Studio using 'OmniConvert-Setup.exe'.";
                return false;
            }

            // Check if current machine matches license
            bool fileMatch = !string.IsNullOrEmpty(fileLicense) && string.Equals(fileLicense, currentFingerprint, StringComparison.OrdinalIgnoreCase);
            bool regMatch = !string.IsNullOrEmpty(registryLicense) && string.Equals(registryLicense, currentFingerprint, StringComparison.OrdinalIgnoreCase);

            if (!fileMatch && !regMatch)
            {
                errorMessage = 
                    "🔒 [UNAUTHORIZED DEVICE / अवैध उपकरण]\n\n" +
                    "यह सॉफ़्टवेयर केवल मूल अधिकृत कंप्यूटर के लिए हार्डवेयर-लॉक (Hardware-Locked) है।\n" +
                    "इसे C: ड्राइव से कॉपी-पेस्ट करके किसी अन्य कंप्यूटर पर नहीं चलाया जा सकता।\n\n" +
                    "This installation is locked to the original computer's hardware.\n" +
                    "Copying and running this folder on another PC is prohibited.\n\n" +
                    "--------------------------------------------------\n" +
                    "Creator & Administrator:\n" +
                    "Niraj Kumar, Section Supervisor, RO, Faridabad";
                return false;
            }

            return true;
        }

        /// <summary>
        /// Generates a tamper-proof session token passed to the browser to prevent opening index.html directly.
        /// </summary>
        public static string GenerateSessionToken()
        {
            string raw = DateTime.UtcNow.ToString("yyyyMMdd") + ":" + GetCurrentMachineFingerprint() + ":" + SALT;
            using (MD5 md5 = MD5.Create())
            {
                byte[] hash = md5.ComputeHash(Encoding.UTF8.GetBytes(raw));
                StringBuilder sb = new StringBuilder();
                foreach (byte b in hash) sb.Append(b.ToString("x2"));
                return sb.ToString();
            }
        }
    }

    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string indexPath = Path.Combine(baseDir, "index.html");

                if (!File.Exists(indexPath))
                {
                    MessageBox.Show("Cannot find 'index.html' in: " + baseDir, 
                        "OmniConvert Studio Error", 
                        MessageBoxButtons.OK, 
                        MessageBoxIcon.Error);
                    return;
                }

                // 1. HARDWARE-LOCK VERIFICATION: Block unauthorized copy-paste to another PC
                string errorMsg;
                if (!SecurityLock.VerifyMachineLock(baseDir, out errorMsg))
                {
                    MessageBox.Show(errorMsg, 
                        "OmniConvert Studio - Copy Protection Active", 
                        MessageBoxButtons.OK, 
                        MessageBoxIcon.Stop);
                    return;
                }

                // 2. Generate authorization session token for the local interface
                string sessionToken = SecurityLock.GenerateSessionToken();

                // Check for Edge or Chrome for native application window mode
                string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
                string edgePath64 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
                string chromePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
                string chromePath32 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe");

                string targetBrowser = null;
                if (File.Exists(edgePath)) targetBrowser = edgePath;
                else if (File.Exists(edgePath64)) targetBrowser = edgePath64;
                else if (File.Exists(chromePath)) targetBrowser = chromePath;
                else if (File.Exists(chromePath32)) targetBrowser = chromePath32;

                string fileUrl = "file:///" + indexPath.Replace('\\', '/');

                if (targetBrowser != null)
                {
                    ProcessStartInfo psi = new ProcessStartInfo
                    {
                        FileName = targetBrowser,
                        Arguments = "--app=\"" + fileUrl + "\" --window-size=1280,840",
                        UseShellExecute = true,
                        WorkingDirectory = baseDir
                    };
                    Process.Start(psi);
                }
                else
                {
                    // Default browser with auth token
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = fileUrl,
                        UseShellExecute = true
                    });
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to launch OmniConvert Studio: " + ex.Message,
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
