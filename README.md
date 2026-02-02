<p align="center">
    <img width="25%" height="25%" alt="logo2" src="https://github.com/user-attachments/assets/5596a357-61c3-471c-9a1e-b8c3d6de33c8" />
</p>

<h1 align="center"> Vue-After-Free </h1>
<p  align="center">
    A PlayStation Vue userland code execution exploit. 
</p>

> PlayStation 4 only.

# Vue After Free Userland
CVE-2018-4441 was shortly applied but due to instability and bad success rate it was dropped.   
CVE-2017-7117 is used for the userland, and has been chained with Lapse and Poopsploit(netctrl) kernel exploits on respective firmwares marked below.


## Vulnerability Scope
KEX= Kernel Exploit
| vue-after-free (Userland) | Lapse (KEX) | Poopsploit (KEX) |
| :------------------------ | :---------- | :--------------- |
| 5.05–13.04                | 1.01–12.02  | 1.01-13.00       |

## Supported by this Repository

This table indicates firmware versions for which the _current version_ of this repository provides a functional tested jailbreak for. 

| 7.00-13.00 |
| :--------- |

* By default Lapse is used from 7.00 to 12.02, and Poopsploit from 12.50-13.00. Although you can choose to run Poopsploit on as low as 9.00.
* Userland exploit works 5.05 to 13.02 as is.

# FAQ 
Q: Will this work on 13.02 or above? A: Only the userland, you cannot jailbreak above 13.00 with the files in this repo. 
Q: I ran Vue and my console shutdown what do i do? A: If a kernel panic occured you may need to press the power button on your console twice, then retry running the exploit.   
Q: How can I run a payload? A: Closing and Reopening Vue is required between payload runs. Select the payload from the UI. 

## Requirments
  * Firmware 9.00 or above. 

### For Jailbroken PS4
  * Fake or legit activated PS4 user account.
  * FTP access to the console.
  * USB flash drive.

  * Playstation Vue 1.01 base and 1.24 patch.(Referred to as "PS Vue" later in the guide). [Download](https://www.mediafire.com/file/45owcabezln2ykm/CUSA00960.zip/file)
  
### For Non-Jailbroken PS4
  * USB flash drive.
  * System backup file.
> [!WARNING]
> Restoring the system backup will erase all data on your console, then apply the vue app and it's exploit data to it. 

# Setup Instructions 
## Jailbroken PS4
  1. Jailbreak your console. 
  2. Enable FTP. 
  3. Install Apollo Save Tool. https://pkg-zone.com/details/APOL00004
  4. Install PS Vue 1.01 pkg and 1.24 patch. 
  5. Connect to the console with FTP. 
  6. Download the ManualSetup.zip from releases.
  7. Go to the following path with FTP user/download/CUSA00960 (create path if needed) and place download0.dat there.
  8. On your USB unpack the save.zip.
  9. In the root of your USB place HEN or GoldHEN named as payload.bin. Or place it in /data/.
  10. Plug the USB into the console.
  11. In Apollo Save Tool go to USB Saves and select the PS Vue save(CUSA00960) and choose the option "Copy save game to HDD". 
  12. Reboot your console then open PS Vue run the exploit by pressing on the jailbreak button or configure the autoloader.
  13. Optionally after jailbreaking run the [np-fake-signin](https://github.com/Vuemony/vue-after-free/blob/main/README.md#np-fake-signin) payload to avoid the PSN pop-up.

## Non-Jailbroken PS4
  1. Format your USB Drive to Exfat. 
> [!WARNING]
> This will wipe your drive of all data. Backup any important data. 
  2. Download the SystemBackup.zip from Releases.
  3. Unpack the contents of the zip onto the USB.
  4. Plug the USB into your console. 
  5. If you have a real PSN account on the console go to Settings>Application Saved Data Management>Saved Data in System Storage and backup your savedata to the USB. (Sufficient space required.)
  * If you cannot access the savedata you do not have a Real PSN account or fake activated account, meaning that if you do not jailbreak first you cannot backup your saves.
  6. Go to Settings>Storage>System Storage>Capture Gallery>All and backup your captures to the USB. (Sufficient space required.)
  7. Go to Settings>System>Back Up and Restore>Restore PS4 and select the the system backup there and restore it. 
  8. When the console reboots you will have a fake activated user account and PS Vue and it's exploit data. 
  9. In the root of your USB place HEN or GoldHEN named as payload.bin.
  10. Open PS Vue run the exploit by pressing on the jailbreak button or configure the autoloader.
  11. Optionally after jailbreaking run the [np-fake-signin](https://github.com/Vuemony/vue-after-free/blob/main/README.md#np-fake-signin) payload to avoid the PSN pop-up.
  * User account ID is "1111111111111111" you cannot change it but you can create another user and fake activate it, then while jailbroken follow the instructions above for jailbroken users to set up PS Vue while signed into the newly activated account.

# Connecting to the internet. 
  1. Navigate to Settings > System > Automatic Downloads, and uncheck "Featured Content", "System Software Update Files" and "Application Update Files".
  2. Navigate to Settings > Network > Check Connect to the Internet, then Set Up Internet Connection.
  3. Connection: Wi-Fi or LAN cable
  4. Set Up: Custom
  5. IP Address: Automatic
  6. DHCP Host Name: Do Not Specify
  7. DNS Settings: Manual
  8. Primary DNS: 62.210.38.117 (Leave the secondary blank as it is)
  9. MTU Settings: Automatic
  10. Proxy Server: Do Not Use
  11. Test the internet connection if you get an IP address it's working. 
  * The internet connection failing does not indicate that it actually cannot connect to the internet, it just means the PS4 cannot communicate with Sony servers which is the point of the DNS


# Payloads
Vue After Free comes preloaded with some payloads. 

### NP-Fake-SignIn
The np-fake-signin payload gets rid of the first PS Vue pop-up asking you to sign into PSN. 
In the payloads section of Vue, you will see np-fake-signin-ps4-vue.elf and np-fake-signin-ps4-user.elf. 
np-fake-signin-ps4-vue.elf should only be used if you are using the system backup provided on this repo. 
np-fake-signin-ps4-user.elf should be used for any other fake activated user account. 

## FTP 
The ftp-server.ts payload gives you sandbox FTP to quickly swap exploit or cosmetic files without running a kernel exploit/jailbreaking.

## WebUI

## ELFLDR
elfldr.elf is used to load elf and bin payloads post exploit when HEN or GoldHEN have not been loaded. 

## AIOFIX 
This elf file is automatically loaded when the lapse kernel exploit has executed successfully it fixes issues in some games. It is not needed for poopsploit/netctrl.

# Credits 
- [c0w-ar](https://github.com/c0w-ar/)
- [earthonion](https://github.com/earthonion)
- [ufm42](https://github.com/ufm42)
- [D-Link Turtle](https://github.com/iMrDJAi) 
- [Gezine](https://github.com/gezine)
- [Helloyunho](https://github.com/Helloyunho)
- [Dr.Yenyen](https://github.com/DrYenyen)
- [AlAzif](https://github.com/Al-Azif) Reference for exploit table and retail application advice.
- abc
- [TheFlow](https://github.com/TheOfficialFloW)
- [Lua Loader project](https://github.com/shahrilnet/remote_lua_loader)

## payload sources:
- [elfldr.elf](https://github.com/ps4-payload-dev/elfldr) by John Törnblom 
- [AIOfix_network.elf](https://github.com/Gezine/BD-JB-1250/blob/main/payloads/lapse/src/org/bdj/external/aiofix_network.c) by Gezine
- [np-fake-signin](https://github.com/earthonion/np-fake-signin) by earthonion
