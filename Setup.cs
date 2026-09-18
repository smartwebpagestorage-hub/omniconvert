using System;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("OmniConvert Studio Setup")]
[assembly: AssemblyDescription("Secure Installer for OmniConvert Studio on Windows 10 & 11")]
[assembly: AssemblyCompany("Regional Office (RO), Faridabad")]
[assembly: AssemblyProduct("OmniConvert Studio Setup")]
[assembly: AssemblyCopyright("Developed by Niraj Kumar, Section Supervisor, RO, Faridabad")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace OmniConvertSetup
{
    static class SecurityLock
    {
        private const string SALT = "OmniConvert_NirajKumar_RO_Faridabad_SecretSalt_2026_HardwareLock";
        public const string REQUIRED_KEY = "040278221195080511110416";

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
    }

    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            try
            {
                string sourceDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\', '/');
                string iconPath = Path.Combine(sourceDir, @"assets\icon.ico");

                // 1. LICENSE KEY PROMPT: Ask user for the 24-digit authorization key before proceeding
                if (!PromptForLicenseKey(iconPath))
                {
                    // User cancelled or closed dialog
                    return;
                }

                // Standard Windows Per-User Program directory (No Admin rights required, permanent on PC)
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string installDir = Path.Combine(localAppData, "Programs", "OmniConvert");

                bool needCopy = !string.Equals(sourceDir, installDir, StringComparison.OrdinalIgnoreCase);

                if (needCopy)
                {
                    if (!Directory.Exists(installDir))
                    {
                        Directory.CreateDirectory(installDir);
                    }
                    CopyDirectory(sourceDir, installDir);
                }

                // 2. HARDWARE-LOCK: Generate and bind machine fingerprint for this specific PC
                string hardwareKey = SecurityLock.GetCurrentMachineFingerprint();
                string licensePath = Path.Combine(installDir, "app.license");
                File.WriteAllText(licensePath, hardwareKey);

                // Save to CurrentUser Registry as secondary tamper-proof anchor
                try
                {
                    using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\OmniConvert"))
                    {
                        if (key != null)
                        {
                            key.SetValue("HardwareKey", hardwareKey);
                            key.SetValue("InstalledOn", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"));
                            key.SetValue("Creator", "Niraj Kumar, Section Supervisor, RO, Faridabad");
                            key.SetValue("ActivationStatus", "Authorized");
                        }
                    }
                }
                catch {}

                string installedExePath = Path.Combine(installDir, "OmniConvert.exe");
                string installedIconPath = Path.Combine(installDir, @"assets\icon.ico");

                if (!File.Exists(installedExePath))
                {
                    installedExePath = Path.Combine(installDir, "start.bat");
                }

                // Create Windows Shortcuts on Desktop and Start Menu pointing to permanent PC installDir
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                dynamic shell = Activator.CreateInstance(shellType);

                string desktopFolder = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                string startMenuFolder = Environment.GetFolderPath(Environment.SpecialFolder.Programs);

                string[] targetShortcuts = new string[]
                {
                    Path.Combine(desktopFolder, "OmniConvert Studio.lnk"),
                    Path.Combine(startMenuFolder, "OmniConvert Studio.lnk")
                };

                foreach (string scPath in targetShortcuts)
                {
                    dynamic shortcut = shell.CreateShortcut(scPath);
                    shortcut.TargetPath = installedExePath;
                    shortcut.WorkingDirectory = installDir;
                    shortcut.Description = "OmniConvert Studio - Developed by Niraj Kumar, Section Supervisor, RO, Faridabad";
                    if (File.Exists(installedIconPath))
                    {
                        shortcut.IconLocation = installedIconPath + ",0";
                    }
                    shortcut.Save();
                }

                // Register in Windows Settings -> Apps & Control Panel (Add/Remove Programs)
                try
                {
                    using (RegistryKey uKey = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\OmniConvert"))
                    {
                        if (uKey != null)
                        {
                            uKey.SetValue("DisplayName", "OmniConvert Studio");
                            uKey.SetValue("DisplayVersion", "1.0.0");
                            uKey.SetValue("Publisher", "Niraj Kumar, Section Supervisor, RO, Faridabad");
                            uKey.SetValue("InstallLocation", installDir);
                            if (File.Exists(installedIconPath))
                            {
                                uKey.SetValue("DisplayIcon", installedIconPath);
                            }
                            string uninstExe = Path.Combine(installDir, "Uninstall.exe");
                            if (File.Exists(uninstExe))
                            {
                                uKey.SetValue("UninstallString", "\"" + uninstExe + "\"");
                            }
                            else
                            {
                                uKey.SetValue("UninstallString", "\"" + Path.Combine(installDir, "Uninstall.bat") + "\"");
                            }
                        }
                    }
                }
                catch {}

                // Create Uninstall Shortcut in Start Menu
                try
                {
                    string uninstExe = Path.Combine(installDir, "Uninstall.exe");
                    string uninstSc = Path.Combine(startMenuFolder, "Uninstall OmniConvert.lnk");
                    dynamic uShortcut = shell.CreateShortcut(uninstSc);
                    uShortcut.TargetPath = File.Exists(uninstExe) ? uninstExe : Path.Combine(installDir, "Uninstall.bat");
                    uShortcut.WorkingDirectory = installDir;
                    uShortcut.Description = "Uninstall OmniConvert Studio";
                    uShortcut.Save();
                }
                catch {}

                // Create Uninstaller batch in installDir as fallback
                string uninstallScript = Path.Combine(installDir, "Uninstall.bat");
                File.WriteAllText(uninstallScript,
                    "@echo off\r\n" +
                    "echo Uninstalling OmniConvert Studio...\r\n" +
                    "del \"%USERPROFILE%\\Desktop\\OmniConvert Studio.lnk\" 2>nul\r\n" +
                    "del \"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\OmniConvert Studio.lnk\" 2>nul\r\n" +
                    "del \"%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Uninstall OmniConvert.lnk\" 2>nul\r\n" +
                    "reg delete \"HKCU\\Software\\OmniConvert\" /f 2>nul\r\n" +
                    "reg delete \"HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\OmniConvert\" /f 2>nul\r\n" +
                    "echo Shortcuts and registry keys removed.\r\n" +
                    "start /b \"\" cmd /c \"timeout /t 1 /nobreak >nul & rd /s /q \\\"" + installDir.Replace("\\", "\\\\") + "\\\"\"\r\n" +
                    "exit\r\n");

                MessageBox.Show(
                    "OmniConvert Studio has been successfully installed on this computer!\n\n" +
                    "✔ Key Verified & Activated (कुंजी सत्यापित):\n" +
                    "   लाइसेंस कुंजी सफलतापूर्वक स्वीकार की गई।\n\n" +
                    "✔ Hardware Lock Active (सुरक्षा लॉक):\n" +
                    "   यह सॉफ्टवेयर इस कंप्यूटर के हार्डवेयर से लॉक कर दिया गया है।\n" +
                    "   कोई भी इसे कॉपी-पेस्ट करके दूसरे कंप्यूटर पर नहीं चला सकेगा।\n\n" +
                    "✔ Permanently installed at:\n" +
                    "   " + installDir + "\n\n" +
                    "✔ You can now SAFELY REMOVE / UNPLUG your Pen Drive!\n" +
                    "✔ Launch anytime from your Desktop or Start Menu.\n\n" +
                    "Created by: Niraj Kumar, Section Supervisor, RO, Faridabad\n" +
                    "100% Offline & Protected.",
                    "OmniConvert Studio - Setup Successful",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Installation error: " + ex.Message,
                    "Setup Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        static bool PromptForLicenseKey(string iconPath)
        {
            using (Form form = new Form())
            {
                form.Text = "OmniConvert Studio Setup - Activation Key Required";
                form.Size = new Size(540, 340);
                form.StartPosition = FormStartPosition.CenterScreen;
                form.FormBorderStyle = FormBorderStyle.FixedDialog;
                form.MaximizeBox = false;
                form.MinimizeBox = false;
                form.BackColor = Color.FromArgb(248, 250, 252);
                form.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

                if (File.Exists(iconPath))
                {
                    try { form.Icon = new Icon(iconPath); } catch {}
                }

                // Top Header Banner
                Panel header = new Panel
                {
                    Dock = DockStyle.Top,
                    Height = 72,
                    BackColor = Color.FromArgb(15, 23, 42) // Slate 900
                };

                Label lblTitle = new Label
                {
                    Text = "OmniConvert Studio Setup",
                    Font = new Font("Segoe UI", 12.5f, FontStyle.Bold),
                    ForeColor = Color.White,
                    Location = new Point(20, 12),
                    AutoSize = true
                };

                Label lblSub = new Label
                {
                    Text = "Developed by Niraj Kumar, Section Supervisor, RO, Faridabad",
                    Font = new Font("Segoe UI", 9.0f, FontStyle.Regular),
                    ForeColor = Color.FromArgb(148, 163, 184),
                    Location = new Point(21, 40),
                    AutoSize = true
                };

                header.Controls.Add(lblTitle);
                header.Controls.Add(lblSub);
                form.Controls.Add(header);

                // Instruction Labels
                Label lblPromptHi = new Label
                {
                    Text = "कृपया सॉफ़्टवेयर संस्थापित करने के लिए 24-अंकों की उत्पाद कुंजी दर्ज करें:",
                    Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                    ForeColor = Color.FromArgb(30, 41, 59),
                    Location = new Point(20, 90),
                    AutoSize = true
                };

                Label lblPromptEn = new Label
                {
                    Text = "Enter the 24-digit installation license key to proceed with setup:",
                    Font = new Font("Segoe UI", 8.5f, FontStyle.Regular),
                    ForeColor = Color.FromArgb(100, 116, 139),
                    Location = new Point(21, 114),
                    AutoSize = true
                };

                // Text Box for Key
                TextBox txtKey = new TextBox
                {
                    Location = new Point(22, 142),
                    Size = new Size(478, 30),
                    Font = new Font("Consolas", 12.0f, FontStyle.Bold),
                    ForeColor = Color.FromArgb(15, 23, 42),
                    MaxLength = 36
                };

                // Error Message Label
                Label lblError = new Label
                {
                    Text = "",
                    Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                    ForeColor = Color.FromArgb(220, 38, 38),
                    Location = new Point(21, 180),
                    Size = new Size(480, 40)
                };

                // Buttons Panel
                Panel footer = new Panel
                {
                    Dock = DockStyle.Bottom,
                    Height = 60,
                    BackColor = Color.FromArgb(241, 245, 249)
                };

                Button btnInstall = new Button
                {
                    Text = "Verify & Install (इंस्टॉल करें)",
                    Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                    BackColor = Color.FromArgb(79, 70, 229),
                    ForeColor = Color.White,
                    FlatStyle = FlatStyle.Flat,
                    Size = new Size(185, 36),
                    Location = new Point(205, 12),
                    Cursor = Cursors.Hand
                };
                btnInstall.FlatAppearance.BorderSize = 0;

                Button btnCancel = new Button
                {
                    Text = "Cancel (रद्द करें)",
                    Font = new Font("Segoe UI", 9.0f, FontStyle.Regular),
                    BackColor = Color.White,
                    ForeColor = Color.FromArgb(71, 85, 105),
                    FlatStyle = FlatStyle.Flat,
                    Size = new Size(105, 36),
                    Location = new Point(400, 12),
                    Cursor = Cursors.Hand
                };
                btnCancel.FlatAppearance.BorderColor = Color.FromArgb(203, 213, 225);

                btnCancel.Click += (s, e) => {
                    form.DialogResult = DialogResult.Cancel;
                    form.Close();
                };

                btnInstall.Click += (s, e) => {
                    string entered = (txtKey.Text ?? "").Trim();
                    if (string.Equals(entered, SecurityLock.REQUIRED_KEY, StringComparison.Ordinal))
                    {
                        form.DialogResult = DialogResult.OK;
                        form.Close();
                    }
                    else
                    {
                        lblError.Text = "❌ अमान्य लाइसेंस कुंजी! (Invalid Key) कृपया सही 24-अंकों की कुंजी दर्ज करें।\nContact: Niraj Kumar, Section Supervisor, RO, Faridabad";
                        txtKey.SelectAll();
                        txtKey.Focus();
                    }
                };

                form.AcceptButton = btnInstall;
                form.CancelButton = btnCancel;

                footer.Controls.Add(btnInstall);
                footer.Controls.Add(btnCancel);

                form.Controls.Add(lblPromptHi);
                form.Controls.Add(lblPromptEn);
                form.Controls.Add(txtKey);
                form.Controls.Add(lblError);
                form.Controls.Add(footer);

                txtKey.Focus();

                return form.ShowDialog() == DialogResult.OK;
            }
        }

        static void CopyDirectory(string sourceDir, string targetDir)
        {
            Directory.CreateDirectory(targetDir);

            foreach (string file in Directory.GetFiles(sourceDir))
            {
                string fileName = Path.GetFileName(file);
                if (fileName.Equals("OmniConvert-Setup.exe", StringComparison.OrdinalIgnoreCase)) continue;
                string dest = Path.Combine(targetDir, fileName);
                File.Copy(file, dest, true);
            }

            foreach (string subDir in Directory.GetDirectories(sourceDir))
            {
                string dirName = Path.GetFileName(subDir);
                if (dirName.Equals(".git", StringComparison.OrdinalIgnoreCase) ||
                    dirName.Equals("node_modules", StringComparison.OrdinalIgnoreCase) ||
                    dirName.Equals(".gemini", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }
                string nextTarget = Path.Combine(targetDir, dirName);
                CopyDirectory(subDir, nextTarget);
            }
        }
    }
}
