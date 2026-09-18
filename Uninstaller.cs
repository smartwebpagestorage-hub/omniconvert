using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("OmniConvert Studio Uninstaller")]
[assembly: AssemblyDescription("Completely uninstalls OmniConvert Studio from Windows")]
[assembly: AssemblyCompany("Regional Office (RO), Faridabad")]
[assembly: AssemblyProduct("OmniConvert Studio")]
[assembly: AssemblyCopyright("Developed by Niraj Kumar, Section Supervisor, RO, Faridabad")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

namespace OmniConvert
{
    static class Uninstaller
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            try
            {
                DialogResult dr = MessageBox.Show(
                    "क्या आप वाकई OmniConvert Studio को इस कंप्यूटर से पूरी तरह अनइंस्टॉल (हटाना) चाहते हैं?\n\n" +
                    "Are you sure you want to completely uninstall OmniConvert Studio and remove all its files from this PC?\n\n" +
                    "Developer: Niraj Kumar, Section Supervisor, RO, Faridabad",
                    "OmniConvert Studio - Uninstall Confirmation",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question);

                if (dr != DialogResult.Yes)
                {
                    return;
                }

                string baseDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd('\\', '/');

                // 1. Remove Desktop & Start Menu Shortcuts
                string desktopShortcut = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "OmniConvert Studio.lnk");
                string startMenuShortcut = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "OmniConvert Studio.lnk");
                string startMenuUninstall = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "Uninstall OmniConvert.lnk");

                try { if (File.Exists(desktopShortcut)) File.Delete(desktopShortcut); } catch {}
                try { if (File.Exists(startMenuShortcut)) File.Delete(startMenuShortcut); } catch {}
                try { if (File.Exists(startMenuUninstall)) File.Delete(startMenuUninstall); } catch {}

                // 2. Remove Registry entries
                try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\OmniConvert", false); } catch {}
                try { Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\OmniConvert", false); } catch {}

                MessageBox.Show(
                    "OmniConvert Studio को आपके कंप्यूटर से सफलतापूर्वक हटा दिया गया है!\n\n" +
                    "✔ सभी डेस्कटॉप शॉर्टकट और रजिस्ट्री कुंजियाँ हटा दी गई हैं।\n" +
                    "✔ सभी प्रोग्राम फ़ाइलें हटाई जा रही हैं।\n\n" +
                    "OmniConvert Studio has been successfully uninstalled from your computer.",
                    "Uninstall Complete / अनइंस्टॉलेशन पूर्ण",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);

                // 3. Self-delete folder via detached cmd process after exiting
                string cmdArgs = string.Format("/c timeout /t 1 /nobreak >nul & rd /s /q \"{0}\"", baseDir);
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = cmdArgs,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true,
                    UseShellExecute = true
                };
                Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Uninstallation encountered an error: " + ex.Message,
                    "Uninstall Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
