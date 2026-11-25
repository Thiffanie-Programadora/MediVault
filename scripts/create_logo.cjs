const fs = require('fs');
const path = require('path');

// Clean SVG version with shield, medical notebook, and cross
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#253852" />
      <stop offset="100%" stop-color="#192537" />
    </linearGradient>
    <linearGradient id="slateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6F93A6" />
      <stop offset="100%" stop-color="#5A7B8C" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#15202e" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Circular subtle backdrop -->
  <circle cx="256" cy="256" r="248" fill="#F9FAFB" stroke="#5A7B8C" stroke-width="4" stroke-opacity="0.3"/>

  <!-- Outer Shield -->
  <g filter="url(#shadow)">
    <path d="M 256,44 
             C 370,44 424,80 424,196 
             C 424,324 330,416 256,464 
             C 182,416 88,324 88,196 
             C 88,80 142,44 256,44 Z" 
          fill="url(#shieldGrad)" 
          stroke="#5A7B8C" 
          stroke-width="8" 
          stroke-linejoin="round" />
  </g>

  <!-- Shield inner bevel / accent border -->
  <path d="M 256,66 
           C 354,66 400,98 400,198 
           C 400,308 318,388 256,432 
           C 194,388 112,308 112,198 
           C 112,98 158,66 256,66 Z" 
        fill="none" 
        stroke="#5A7B8C" 
        stroke-width="3" 
        stroke-dasharray="6,4" 
        stroke-opacity="0.6" />

  <!-- Medical Notebook (Expediente Clínico / Libreta) -->
  <g id="notebook" filter="url(#shadow)">
    <!-- Notebook Base Cover -->
    <rect x="168" y="148" width="176" height="224" rx="14" ry="14" fill="#FFFFFF" stroke="#5A7B8C" stroke-width="4" />
    
    <!-- Notebook Spine Accent (Left band) -->
    <path d="M 168,162 C 168,154 174,148 182,148 L 198,148 L 198,372 L 182,372 C 174,372 168,366 168,358 Z" fill="#253852" />

    <!-- Spiral Rings / Binding notches -->
    <circle cx="198" cy="180" r="5" fill="#5A7B8C" />
    <circle cx="198" cy="216" r="5" fill="#5A7B8C" />
    <circle cx="198" cy="252" r="5" fill="#5A7B8C" />
    <circle cx="198" cy="288" r="5" fill="#5A7B8C" />
    <circle cx="198" cy="324" r="5" fill="#5A7B8C" />

    <!-- Notebook Lined Content Lines -->
    <line x1="222" y1="182" x2="320" y2="182" stroke="#5A7B8C" stroke-width="3" stroke-linecap="round" stroke-opacity="0.35" />
    <line x1="222" y1="202" x2="300" y2="202" stroke="#5A7B8C" stroke-width="3" stroke-linecap="round" stroke-opacity="0.35" />
    <line x1="222" y1="320" x2="320" y2="320" stroke="#5A7B8C" stroke-width="3" stroke-linecap="round" stroke-opacity="0.35" />
    <line x1="222" y1="340" x2="280" y2="340" stroke="#5A7B8C" stroke-width="3" stroke-linecap="round" stroke-opacity="0.35" />

    <!-- Medical Cross (+ Embossed in Slate & Navy) -->
    <g id="medical-cross">
      <!-- Cross Horizontal Bar -->
      <rect x="228" y="244" width="68" height="24" rx="5" fill="#253852" />
      <!-- Cross Vertical Bar -->
      <rect x="250" y="222" width="24" height="68" rx="5" fill="#253852" />
      <!-- Inner Cross Highlight -->
      <rect x="232" y="248" width="60" height="16" rx="3" fill="#5A7B8C" fill-opacity="0.3" />
      <rect x="254" y="226" width="16" height="60" rx="3" fill="#5A7B8C" fill-opacity="0.3" />
    </g>
  </g>

  <!-- Security Keyhole / Lock Badge at Shield Crest -->
  <circle cx="256" cy="108" r="14" fill="#5A7B8C" />
  <polygon points="253,108 259,108 261,126 251,126" fill="#5A7B8C" />
</svg>`;

// Also build an uncompressed/baseline valid JPEG image using pure Node
// A simple 256x256 JPEG can be generated using a standard baseline JPEG encoder algorithm
// Let's write a tiny pure JS JPEG encoder
function createJpegBuffer(width, height) {
  // We can write a pure JS minimal JPEG encoder
  // Or create a BMP / JPEG stream. Let's implement a robust standard JPEG encoder:
  // Standard JPEG tables
  const YTable = new Uint8Array([
    16, 11, 10, 16, 24, 40, 51, 61,
    12, 12, 14, 19, 26, 58, 60, 55,
    14, 13, 16, 24, 40, 57, 69, 56,
    14, 17, 22, 29, 51, 87, 80, 62,
    18, 22, 37, 56, 68, 109, 103, 77,
    24, 35, 55, 64, 81, 104, 113, 92,
    49, 64, 78, 87, 103, 121, 120, 101,
    72, 92, 95, 98, 112, 100, 103, 99
  ]);
  const UVTable = new Uint8Array([
    17, 18, 24, 47, 99, 99, 99, 99,
    18, 21, 26, 66, 99, 99, 99, 99,
    24, 26, 56, 99, 99, 99, 99, 99,
    47, 66, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99
  ]);

  // Standard Huffman DC and AC luminance/chrominance tables
  const std_dc_luminance_nrcodes = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
  const std_dc_luminance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const std_dc_chrominance_nrcodes = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
  const std_dc_chrominance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const std_ac_luminance_nrcodes = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
  const std_ac_luminance_values = [
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12,
    0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
    0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
    0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0,
    0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16,
    0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
    0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
    0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
    0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
    0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79,
    0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98,
    0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
    0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
    0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5,
    0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4,
    0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
    0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea,
    0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
    0xf9, 0xfa
  ];
  const std_ac_chrominance_nrcodes = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
  const std_ac_chrominance_values = [
    0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21,
    0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71,
    0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91,
    0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0,
    0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34,
    0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26,
    0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38,
    0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
    0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
    0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
    0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78,
    0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
    0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96,
    0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5,
    0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4,
    0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3,
    0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2,
    0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda,
    0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9,
    0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
    0xf9, 0xfa
  ];

  function computeHuffmanTbl(nrcodes, std_values) {
    let pos_in_table = 0;
    const HT = [];
    for (let k = 1; k <= 16; k++) {
      for (let j = 1; j <= nrcodes[k]; j++) {
        HT[std_values[pos_in_table]] = [];
        HT[std_values[pos_in_table]][0] = k;
        pos_in_table++;
      }
    }
    let code = 0;
    for (let k = 1; k <= 16; k++) {
      for (let j = 0; j < 256; j++) {
        if (HT[j] && HT[j][0] === k) {
          HT[j][1] = code;
          code++;
        }
      }
      code *= 2;
    }
    return HT;
  }

  const DCHuffmanY = computeHuffmanTbl(std_dc_luminance_nrcodes, std_dc_luminance_values);
  const DCHuffmanUV = computeHuffmanTbl(std_dc_chrominance_nrcodes, std_dc_chrominance_values);
  const ACHuffmanY = computeHuffmanTbl(std_ac_luminance_nrcodes, std_ac_luminance_values);
  const ACHuffmanUV = computeHuffmanTbl(std_ac_chrominance_nrcodes, std_ac_chrominance_values);

  // Pixel generation: 256x256 rendering
  // Palette: #253852 (37, 56, 82), #5A7B8C (90, 123, 140), #F9FAFB (249, 250, 251), #FFFFFF (255, 255, 255)
  const rgb = new Uint8Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      // Default background #F9FAFB
      let r = 249, g = 250, b = 251;

      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;

      // Shield boundaries
      const inShieldTop = y >= 25 && y <= 100 && Math.abs(dx) <= (85 - (100 - y) * 0.15);
      const shieldCurv = 85 * (1 - Math.pow(Math.max(0, y - 100) / 130, 1.6));
      const inShieldBottom = y > 100 && y <= 230 && Math.abs(dx) <= shieldCurv;
      const inShield = inShieldTop || inShieldBottom;

      if (inShield) {
        // Shield color #253852 (Navy)
        r = 37; g = 56; b = 82;

        // Shield border
        const nearBorder = Math.abs(Math.abs(dx) - (y <= 100 ? 83 : shieldCurv)) < 3 || y <= 28;
        if (nearBorder) {
          // #5A7B8C
          r = 90; g = 123; b = 140;
        }

        // Inside notebook
        // Notebook: x between cx-45 and cx+45, y between 75 and 185
        const inNotebook = x >= cx - 45 && x <= cx + 45 && y >= 75 && y <= 185;
        if (inNotebook) {
          // White #FFFFFF
          r = 255; g = 255; b = 255;

          // Notebook spine (left side)
          if (x <= cx - 35) {
            r = 37; g = 56; b = 82; // Navy spine
          }

          // Medical Cross in center of notebook
          // Center at (cx + 5, 130)
          const mx = cx + 5;
          const my = 130;
          const inCrossH = Math.abs(x - mx) <= 22 && Math.abs(y - my) <= 8;
          const inCrossV = Math.abs(x - mx) <= 8 && Math.abs(y - my) <= 22;
          if (inCrossH || inCrossV) {
            // #253852 Deep Navy Cross
            r = 37; g = 56; b = 82;
            // Inner highlight
            if ((Math.abs(x - mx) <= 18 && Math.abs(y - my) <= 5) || (Math.abs(x - mx) <= 5 && Math.abs(y - my) <= 18)) {
              r = 90; g = 123; b = 140; // Slate accent
            }
          }

          // Lined content on notebook
          if (y === 95 || y === 165) {
            if (x >= cx - 25 && x <= cx + 35) {
              r = 90; g = 123; b = 140;
            }
          }
        }
      }

      rgb[idx] = r;
      rgb[idx + 1] = g;
      rgb[idx + 2] = b;
    }
  }

  // Build minimal JPEG binary
  const out = [];
  function writeByte(b) { out.push(b & 0xff); }
  function writeWord(w) { writeByte((w >> 8) & 0xff); writeByte(w & 0xff); }

  // SOI
  writeWord(0xffd8);

  // APP0 (JFIF)
  writeWord(0xffe0);
  writeWord(16); // length
  // 'JFIF\0'
  writeByte(0x4a); writeByte(0x46); writeByte(0x49); writeByte(0x46); writeByte(0);
  writeByte(1); writeByte(1); // v1.1
  writeByte(0); // density unit
  writeWord(1); writeWord(1); // aspect
  writeByte(0); writeByte(0); // thumbnail

  // DQT (Y table)
  writeWord(0xffdb);
  writeWord(67);
  writeByte(0); // table ID 0
  for (let i = 0; i < 64; i++) writeByte(YTable[i]);

  // DQT (UV table)
  writeWord(0xffdb);
  writeWord(67);
  writeByte(1); // table ID 1
  for (let i = 0; i < 64; i++) writeByte(UVTable[i]);

  // SOF0 (Baseline DCT)
  writeWord(0xffc0);
  writeWord(17);
  writeByte(8); // 8-bit precision
  writeWord(height);
  writeWord(width);
  writeByte(3); // 3 components (YCbCr)
  // Component 1: Y
  writeByte(1); writeByte(0x11); writeByte(0);
  // Component 2: Cb
  writeByte(2); writeByte(0x11); writeByte(1);
  // Component 3: Cr
  writeByte(3); writeByte(0x11); writeByte(1);

  // DHT (Huffman tables)
  function writeDHT(tableId, nrcodes, values) {
    writeWord(0xffc4);
    let len = 3 + 16 + values.length;
    writeWord(len);
    writeByte(tableId);
    for (let i = 1; i <= 16; i++) writeByte(nrcodes[i]);
    for (let i = 0; i < values.length; i++) writeByte(values[i]);
  }
  writeDHT(0x00, std_dc_luminance_nrcodes, std_dc_luminance_values);
  writeDHT(0x10, std_ac_luminance_nrcodes, std_ac_luminance_values);
  writeDHT(0x01, std_dc_chrominance_nrcodes, std_dc_chrominance_values);
  writeDHT(0x11, std_ac_chrominance_nrcodes, std_ac_chrominance_values);

  // SOS (Start of Scan)
  writeWord(0xffda);
  writeWord(12);
  writeByte(3);
  writeByte(1); writeByte(0x00);
  writeByte(2); writeByte(0x11);
  writeByte(3); writeByte(0x11);
  writeByte(0); writeByte(63); writeByte(0);

  // Scan Data encoding (Bitwriter)
  let byteBuffer = 0;
  let bitsLeft = 8;
  function writeBits(bits, len) {
    for (let i = len - 1; i >= 0; i--) {
      const bit = (bits >> i) & 1;
      byteBuffer = (byteBuffer << 1) | bit;
      bitsLeft--;
      if (bitsLeft === 0) {
        writeByte(byteBuffer);
        if (byteBuffer === 0xff) writeByte(0x00); // byte stuffing
        byteBuffer = 0;
        bitsLeft = 8;
      }
    }
  }

  function flushBits() {
    if (bitsLeft < 8) {
      byteBuffer = (byteBuffer << bitsLeft) | ((1 << bitsLeft) - 1);
      writeByte(byteBuffer);
      if (byteBuffer === 0xff) writeByte(0x00);
      byteBuffer = 0;
      bitsLeft = 8;
    }
  }

  // Simple 8x8 DCT transform and Huffman encoder
  const fdtbl_Y = new Float32Array(64);
  const fdtbl_UV = new Float32Array(64);
  const aasf = [
    1.0, 1.387039845, 1.306562965, 1.175875602, 1.0, 0.785694958, 0.541196100, 0.275899379
  ];
  const zigZag = [
     0,  1,  5,  6, 14, 15, 27, 28,
     2,  4,  7, 13, 16, 26, 29, 42,
     3,  8, 12, 17, 25, 30, 41, 43,
     9, 11, 18, 24, 31, 40, 44, 53,
    10, 19, 23, 32, 39, 45, 52, 54,
    20, 22, 33, 38, 46, 51, 55, 60,
    21, 34, 37, 47, 50, 56, 59, 61,
    35, 36, 48, 49, 57, 58, 62, 63
  ];

  for (let row = 0, i = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++, i++) {
      fdtbl_Y[i] = 1 / (YTable[zigZag[i]] * aasf[row] * aasf[col] * 8);
      fdtbl_UV[i] = 1 / (UVTable[zigZag[i]] * aasf[row] * aasf[col] * 8);
    }
  }

  function forwardDCT(b) {
    const d = new Float32Array(64);
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let sum = 0;
        for (let k = 0; k < 8; k++) {
          sum += (b[i * 8 + k] - 128) * Math.cos(((2 * k + 1) * j * Math.PI) / 16);
        }
        d[i * 8 + j] = sum * (j === 0 ? 1 / Math.SQRT2 : 1) * 0.5;
      }
    }
    const res = new Float32Array(64);
    for (let j = 0; j < 8; j++) {
      for (let i = 0; i < 8; i++) {
        let sum = 0;
        for (let k = 0; k < 8; k++) {
          sum += d[k * 8 + j] * Math.cos(((2 * k + 1) * i * Math.PI) / 16);
        }
        res[i * 8 + j] = sum * (i === 0 ? 1 / Math.SQRT2 : 1) * 0.5;
      }
    }
    return res;
  }

  function quantizeAndZigZag(block, fdtbl) {
    const q = new Int16Array(64);
    for (let i = 0; i < 64; i++) {
      q[zigZag[i]] = Math.round(block[i] * fdtbl[i] * 64);
    }
    return q;
  }

  function encodeCategory(val) {
    if (val === 0) return [0, 0];
    const absVal = Math.abs(val);
    const cat = Math.floor(Math.log2(absVal)) + 1;
    let word = val;
    if (val < 0) word = (1 << cat) - 1 + val;
    return [cat, word];
  }

  let prevDCY = 0, prevDCU = 0, prevDCV = 0;

  function encodeBlock(block, prevDC, dcHuff, acHuff) {
    // DC
    const diff = block[0] - prevDC;
    const [cat, word] = encodeCategory(diff);
    const dcCode = dcHuff[cat];
    writeBits(dcCode[1], dcCode[0]);
    if (cat > 0) writeBits(word, cat);

    // AC
    let r = 0;
    for (let k = 1; k < 64; k++) {
      const val = block[k];
      if (val === 0) {
        r++;
      } else {
        while (r > 15) {
          const zrl = acHuff[0xf0];
          writeBits(zrl[1], zrl[0]);
          r -= 16;
        }
        const [acCat, acWord] = encodeCategory(val);
        const code = acHuff[(r << 4) | acCat];
        writeBits(code[1], code[0]);
        writeBits(acWord, acCat);
        r = 0;
      }
    }
    if (r > 0) {
      const eob = acHuff[0x00];
      writeBits(eob[1], eob[0]);
    }
    return block[0];
  }

  // Iterate 8x8 blocks
  for (let by = 0; by < height; by += 8) {
    for (let bx = 0; bx < width; bx += 8) {
      const blockY = new Float32Array(64);
      const blockU = new Float32Array(64);
      const blockV = new Float32Array(64);

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const px = bx + x;
          const py = by + y;
          const idx = (py * width + px) * 3;
          const r = rgb[idx], g = rgb[idx + 1], b = rgb[idx + 2];
          // RGB to YCbCr
          const Y = 0.299 * r + 0.587 * g + 0.114 * b;
          const Cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128;
          const Cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128;

          blockY[y * 8 + x] = Y;
          blockU[y * 8 + x] = Cb;
          blockV[y * 8 + x] = Cr;
        }
      }

      const qY = quantizeAndZigZag(forwardDCT(blockY), fdtbl_Y);
      const qU = quantizeAndZigZag(forwardDCT(blockU), fdtbl_UV);
      const qV = quantizeAndZigZag(forwardDCT(blockV), fdtbl_UV);

      prevDCY = encodeBlock(qY, prevDCY, DCHuffmanY, ACHuffmanY);
      prevDCU = encodeBlock(qU, prevDCU, DCHuffmanUV, ACHuffmanUV);
      prevDCV = encodeBlock(qV, prevDCV, DCHuffmanUV, ACHuffmanUV);
    }
  }

  flushBits();

  // EOI
  writeWord(0xffd9);

  return Buffer.from(out);
}

// Generate the files
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const assetsDir = path.join(rootDir, 'src', 'assets');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

console.log('Generating mediV.svg...');
fs.writeFileSync(path.join(publicDir, 'mediV.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(assetsDir, 'mediV.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');

console.log('Generating mediV.jpg (256x256 valid JPEG)...');
const jpegBuffer = createJpegBuffer(256, 256);
fs.writeFileSync(path.join(publicDir, 'mediV.jpg'), jpegBuffer);
fs.writeFileSync(path.join(assetsDir, 'mediV.jpg'), jpegBuffer);

console.log(`Saved:
- ${path.join(publicDir, 'mediV.jpg')} (${jpegBuffer.length} bytes)
- ${path.join(assetsDir, 'mediV.jpg')} (${jpegBuffer.length} bytes)
- ${path.join(publicDir, 'mediV.svg')}
- ${path.join(assetsDir, 'mediV.svg')}
- ${path.join(publicDir, 'favicon.svg')}`);
