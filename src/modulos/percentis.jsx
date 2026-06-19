// src/modulos/percentis.jsx — PedHub v1.2
// Curvas: OMS 0–60m | Intergrowth-21st 24–42s | Fenton 2013 24–40s
//
// v1.2 — Prop somenteOMS:
//   • somenteOMS=true  → exibe apenas a curva da OMS (uso em Pediatria Geral)
//   • somenteOMS=false → completo: OMS + Intergrowth + Fenton (Hub Neonatal)
//
// v1.1 — Correções:
//   • Sub-componentes movidos para módulo (fix teclado mobile)
//   • Z-score exibido em todas as abas
//
// Fontes clínicas:
//   OMS: WHO Child Growth Standards. WHO, Geneva 2006.
//   Intergrowth-21st: Villar J et al. Lancet 2014;384(9946):857-68.
//   Fenton 2013: Fenton TR & Kim JH. BMC Pediatrics 2013;13:59.

import { useState } from "react";
import { Scale, Info } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TABELAS LMS — OMS (WHO Child Growth Standards 2006)
// ─────────────────────────────────────────────────────────────────────────────
const WHO_PM = [
  [0.3487,3.3464,0.1401],[0.2297,4.4709,0.1330],[0.1970,5.5675,0.1252],
  [0.1681,6.3762,0.1218],[0.1500,7.0023,0.1195],[0.1343,7.5105,0.1180],
  [0.1206,7.9340,0.1168],[0.1086,8.2970,0.1157],[0.0980,8.6151,0.1148],
  [0.0887,8.9014,0.1140],[0.0804,9.1649,0.1135],[0.0730,9.4122,0.1131],
  [0.0663,9.6479,0.1132],[0.0602,9.8749,0.1134],[0.0547,10.0953,0.1136],
  [0.0497,10.3108,0.1141],[0.0453,10.5228,0.1147],[0.0413,10.7319,0.1153],
  [0.0377,10.9385,0.1160],[0.0344,11.1430,0.1168],[0.0313,11.3462,0.1177],
  [0.0285,11.5486,0.1185],[0.0259,11.7504,0.1194],[0.0236,11.9514,0.1203],
  [0.0214,12.1489,0.1212],[0.0193,12.3463,0.1221],[0.0174,12.5453,0.1230],
  [0.0155,12.7481,0.1239],[0.0138,12.9546,0.1247],[0.0121,13.1641,0.1256],
  [0.0105,13.3758,0.1265],[0.0090,13.5898,0.1274],[0.0075,13.8059,0.1282],
  [0.0060,14.0248,0.1291],[0.0046,14.2466,0.1299],[0.0033,14.4715,0.1308],
  [0.0020,14.6996,0.1316],[0.0007,14.9311,0.1325],[-0.0006,15.1662,0.1333],
  [-0.0018,15.4048,0.1342],[-0.0030,15.6472,0.1350],[-0.0042,15.8930,0.1359],
  [-0.0054,16.1418,0.1368],[-0.0065,16.3934,0.1376],[-0.0077,16.6477,0.1385],
  [-0.0088,16.9047,0.1393],[-0.0099,17.1641,0.1402],[-0.0110,17.4254,0.1411],
  [-0.0121,17.6881,0.1419],[-0.0131,17.9513,0.1428],[-0.0141,18.2147,0.1437],
  [-0.0151,18.4775,0.1445],[-0.0161,18.7393,0.1454],[-0.0170,18.9994,0.1463],
  [-0.0180,19.2574,0.1472],[-0.0189,19.5126,0.1481],[-0.0198,19.7645,0.1490],
  [-0.0207,20.0126,0.1499],[-0.0216,20.2563,0.1508],[-0.0225,20.4952,0.1517],
  [-0.0233,20.7291,0.1526]
];
const WHO_PF = [
  [0.3809,3.2322,0.1399],[0.1714,4.1873,0.1379],[0.0962,5.1282,0.1301],
  [0.0402,5.8458,0.1262],[-0.0053,6.4237,0.1243],[-0.0453,6.8985,0.1229],
  [-0.0806,7.2970,0.1218],[-0.1116,7.6422,0.1212],[-0.1390,7.9487,0.1209],
  [-0.1633,8.2254,0.1210],[-0.1848,8.4800,0.1212],[-0.2041,8.7192,0.1215],
  [-0.2214,8.9481,0.1221],[-0.2369,9.1699,0.1228],[-0.2508,9.3877,0.1235],
  [-0.2632,9.6018,0.1241],[-0.2744,9.8124,0.1248],[-0.2845,10.0196,0.1256],
  [-0.2934,10.2238,0.1264],[-0.3014,10.4250,0.1271],[-0.3085,10.6233,0.1278],
  [-0.3149,10.8190,0.1285],[-0.3204,11.0124,0.1292],[-0.3253,11.2038,0.1299],
  [-0.3297,11.3929,0.1306],[-0.3335,11.5797,0.1314],[-0.3368,11.7645,0.1321],
  [-0.3396,11.9475,0.1329],[-0.3420,12.1282,0.1337],[-0.3439,12.3076,0.1344],
  [-0.3454,12.4850,0.1352],[-0.3465,12.6612,0.1360],[-0.3474,12.8363,0.1368],
  [-0.3479,13.0103,0.1376],[-0.3481,13.1839,0.1384],[-0.3480,13.3566,0.1392],
  [-0.3476,13.5288,0.1399],[-0.3469,13.7000,0.1407],[-0.3460,13.8705,0.1415],
  [-0.3448,14.0406,0.1423],[-0.3434,14.2103,0.1431],[-0.3418,14.3802,0.1439],
  [-0.3399,14.5505,0.1447],[-0.3378,14.7217,0.1455],[-0.3355,14.8939,0.1463],
  [-0.3330,15.0676,0.1471],[-0.3303,15.2430,0.1479],[-0.3274,15.4204,0.1488],
  [-0.3244,15.5998,0.1496],[-0.3212,15.7814,0.1504],[-0.3178,15.9652,0.1513],
  [-0.3143,16.1513,0.1521],[-0.3107,16.3397,0.1529],[-0.3069,16.5304,0.1538],
  [-0.3030,16.7234,0.1546],[-0.2989,16.9187,0.1555],[-0.2947,17.1163,0.1563],
  [-0.2904,17.3161,0.1572],[-0.2860,17.5180,0.1580],[-0.2815,17.7220,0.1589],
  [-0.2769,17.9280,0.1597]
];
const WHO_HM = [
  [1,49.88,0.0379],[1,54.72,0.0364],[1,58.42,0.0354],[1,61.43,0.0341],
  [1,63.89,0.0338],[1,65.90,0.0335],[1,67.62,0.0332],[1,69.16,0.0329],
  [1,70.60,0.0327],[1,71.97,0.0325],[1,73.28,0.0323],[1,74.54,0.0321],
  [1,75.75,0.0321],[1,76.92,0.0321],[1,78.05,0.0321],[1,79.15,0.0322],
  [1,80.22,0.0322],[1,81.25,0.0322],[1,82.26,0.0322],[1,83.24,0.0323],
  [1,84.19,0.0323],[1,85.11,0.0323],[1,86.01,0.0323],[1,86.88,0.0324],
  [1,87.10,0.0296],[1,87.94,0.0296],[1,88.77,0.0295],[1,89.59,0.0295],
  [1,90.41,0.0295],[1,91.22,0.0295],[1,92.03,0.0295],[1,92.83,0.0295],
  [1,93.62,0.0295],[1,94.40,0.0295],[1,95.18,0.0295],[1,95.95,0.0295],
  [1,96.71,0.0295],[1,97.47,0.0296],[1,98.22,0.0296],[1,98.96,0.0296],
  [1,99.69,0.0296],[1,100.42,0.0296],[1,101.14,0.0296],[1,101.85,0.0296],
  [1,102.55,0.0297],[1,103.25,0.0297],[1,103.94,0.0297],[1,104.62,0.0297],
  [1,105.30,0.0297],[1,105.97,0.0297],[1,106.63,0.0297],[1,107.29,0.0297],
  [1,107.94,0.0298],[1,108.58,0.0298],[1,109.22,0.0298],[1,109.85,0.0298],
  [1,110.47,0.0298],[1,111.09,0.0298],[1,111.70,0.0298],[1,112.30,0.0298],
  [1,112.89,0.0298]
];
const WHO_HF = [
  [1,49.15,0.0379],[1,53.69,0.0364],[1,57.07,0.0354],[1,59.80,0.0340],
  [1,62.09,0.0337],[1,63.90,0.0335],[1,65.73,0.0332],[1,67.29,0.0328],
  [1,68.75,0.0325],[1,70.14,0.0324],[1,71.48,0.0323],[1,72.77,0.0322],
  [1,74.01,0.0322],[1,75.22,0.0322],[1,76.40,0.0322],[1,77.57,0.0322],
  [1,78.71,0.0322],[1,79.84,0.0322],[1,80.95,0.0322],[1,82.04,0.0322],
  [1,83.12,0.0322],[1,84.18,0.0322],[1,85.22,0.0322],[1,86.25,0.0322],
  [1,85.72,0.0286],[1,86.54,0.0286],[1,87.36,0.0286],[1,88.17,0.0285],
  [1,88.97,0.0285],[1,89.76,0.0285],[1,90.55,0.0285],[1,91.32,0.0285],
  [1,92.09,0.0285],[1,92.85,0.0285],[1,93.61,0.0285],[1,94.35,0.0285],
  [1,95.09,0.0285],[1,95.82,0.0285],[1,96.55,0.0285],[1,97.27,0.0285],
  [1,97.98,0.0285],[1,98.68,0.0285],[1,99.38,0.0285],[1,100.07,0.0285],
  [1,100.75,0.0285],[1,101.43,0.0285],[1,102.10,0.0285],[1,102.76,0.0286],
  [1,103.42,0.0286],[1,104.07,0.0286],[1,104.71,0.0286],[1,105.35,0.0286],
  [1,105.98,0.0286],[1,106.60,0.0286],[1,107.22,0.0286],[1,107.83,0.0286],
  [1,108.43,0.0286],[1,109.02,0.0286],[1,109.61,0.0286],[1,110.19,0.0286],
  [1,110.77,0.0286]
];
const WHO_CM = [
  [1,34.46,0.0363],[1,37.28,0.0321],[1,39.13,0.0303],[1,40.51,0.0296],
  [1,41.63,0.0292],[1,42.56,0.0290],[1,43.33,0.0288],[1,43.98,0.0286],
  [1,44.54,0.0284],[1,45.02,0.0284],[1,45.43,0.0283],[1,45.80,0.0282],
  [1,46.12,0.0281],[1,46.33,0.0281],[1,46.54,0.0281],[1,46.75,0.0281],
  [1,46.96,0.0281],[1,47.17,0.0281],[1,47.38,0.0281],[1,47.59,0.0281],
  [1,47.80,0.0282],[1,48.01,0.0282],[1,48.22,0.0282],[1,48.43,0.0282],
  [1,48.64,0.0283],[1,48.74,0.0283],[1,48.84,0.0283],[1,48.93,0.0283],
  [1,49.02,0.0283],[1,49.12,0.0284],[1,49.21,0.0284],[1,49.30,0.0284],
  [1,49.40,0.0284],[1,49.49,0.0284],[1,49.58,0.0284],[1,49.68,0.0284],
  [1,49.77,0.0285],[1,49.84,0.0285],[1,49.91,0.0285],[1,49.98,0.0285],
  [1,50.05,0.0285],[1,50.12,0.0285],[1,50.19,0.0285],[1,50.26,0.0285],
  [1,50.33,0.0285],[1,50.40,0.0285],[1,50.47,0.0285],[1,50.54,0.0285],
  [1,50.61,0.0285],[1,50.68,0.0285],[1,50.75,0.0285],[1,50.82,0.0285],
  [1,50.89,0.0285],[1,50.96,0.0285],[1,51.03,0.0285],[1,51.10,0.0285],
  [1,51.17,0.0285],[1,51.24,0.0285],[1,51.31,0.0285],[1,51.38,0.0285],
  [1,51.45,0.0285]
];
const WHO_CF = [
  [1,33.88,0.0363],[1,36.55,0.0324],[1,38.27,0.0309],[1,39.48,0.0301],
  [1,40.46,0.0297],[1,41.25,0.0294],[1,42.26,0.0292],[1,42.72,0.0291],
  [1,43.18,0.0290],[1,43.64,0.0289],[1,44.10,0.0289],[1,44.56,0.0289],
  [1,45.02,0.0289],[1,45.22,0.0289],[1,45.42,0.0289],[1,45.62,0.0289],
  [1,45.82,0.0289],[1,46.02,0.0289],[1,46.22,0.0289],[1,46.42,0.0289],
  [1,46.62,0.0289],[1,46.82,0.0289],[1,47.02,0.0289],[1,47.22,0.0289],
  [1,47.42,0.0290],[1,47.54,0.0290],[1,47.65,0.0290],[1,47.77,0.0290],
  [1,47.89,0.0290],[1,48.01,0.0290],[1,48.12,0.0290],[1,48.24,0.0290],
  [1,48.36,0.0290],[1,48.47,0.0290],[1,48.59,0.0290],[1,48.71,0.0290],
  [1,48.82,0.0291],[1,48.88,0.0291],[1,48.94,0.0291],[1,49.00,0.0291],
  [1,49.06,0.0291],[1,49.12,0.0291],[1,49.18,0.0291],[1,49.24,0.0291],
  [1,49.30,0.0291],[1,49.36,0.0291],[1,49.42,0.0291],[1,49.48,0.0291],
  [1,49.54,0.0291],[1,49.59,0.0291],[1,49.63,0.0291],[1,49.67,0.0291],
  [1,49.71,0.0291],[1,49.76,0.0291],[1,49.80,0.0291],[1,49.84,0.0291],
  [1,49.89,0.0291],[1,49.93,0.0291],[1,49.97,0.0291],[1,50.02,0.0291],
  [1,50.06,0.0291]
];

// Fenton 2013
const FEN_PW = {
  M:{24:[460,510,595,695,755],25:[520,582,680,800,872],26:[588,660,775,915,1000],
     27:[665,750,880,1040,1140],28:[750,850,1000,1185,1305],29:[845,965,1140,1358,1495],
     30:[960,1095,1300,1553,1715],31:[1090,1245,1482,1775,1960],32:[1236,1415,1690,2025,2240],
     33:[1395,1600,1910,2295,2540],34:[1567,1800,2153,2590,2868],35:[1750,2015,2415,2905,3220],
     36:[1940,2235,2680,3228,3578],37:[2140,2460,2900,3498,3887],38:[2338,2685,3100,3738,4152],
     39:[2530,2900,3250,3916,4350],40:[2680,2995,3347,4020,4460]},
  F:{24:[440,490,570,668,726],25:[495,553,650,764,834],26:[555,624,736,870,952],
     27:[625,704,834,989,1086],28:[704,794,945,1123,1235],29:[793,900,1075,1281,1411],
     30:[893,1020,1222,1461,1613],31:[1005,1152,1385,1662,1837],32:[1131,1300,1566,1884,2085],
     33:[1269,1462,1765,2128,2358],34:[1418,1638,1980,2391,2655],35:[1579,1826,2210,2672,2971],
     36:[1748,2023,2449,2965,3300],37:[1921,2224,2692,3261,3631],38:[2093,2423,2910,3530,3930],
     39:[2257,2614,3100,3780,4200],40:[2390,2760,3232,3923,4371]}
};
const FEN_LW = {
  M:{24:[28.5,30.0,31.5],25:[29.8,31.5,33.2],26:[31.2,33.0,34.8],27:[32.5,34.5,36.4],
     28:[33.8,36.0,38.1],29:[35.1,37.5,39.9],30:[36.4,39.0,41.6],31:[37.6,40.4,43.2],
     32:[38.8,41.8,44.8],33:[40.0,43.2,46.4],34:[41.1,44.5,47.9],35:[42.2,45.8,49.4],
     36:[43.2,47.0,50.8],37:[44.2,48.2,52.1],38:[45.1,49.3,53.3],39:[45.9,50.3,54.4],
     40:[46.7,51.2,55.4]},
  F:{24:[27.8,29.3,30.8],25:[29.1,30.7,32.3],26:[30.4,32.2,33.9],27:[31.7,33.6,35.5],
     28:[33.0,35.1,37.2],29:[34.3,36.6,38.8],30:[35.6,38.0,40.4],31:[36.8,39.4,41.9],
     32:[38.0,40.7,43.4],33:[39.1,42.0,44.8],34:[40.2,43.3,46.3],35:[41.3,44.5,47.7],
     36:[42.3,45.7,49.0],37:[43.2,46.8,50.3],38:[44.1,47.8,51.5],39:[44.9,48.7,52.5],
     40:[45.7,49.5,53.4]}
};
const FEN_CW = {
  M:{24:[21.5,22.5,23.5],25:[22.5,23.5,24.6],26:[23.4,24.5,25.6],27:[24.3,25.5,26.7],
     28:[25.1,26.4,27.7],29:[26.0,27.3,28.7],30:[26.8,28.2,29.6],31:[27.6,29.1,30.6],
     32:[28.4,30.0,31.6],33:[29.2,30.8,32.5],34:[30.0,31.7,33.4],35:[30.7,32.5,34.3],
     36:[31.4,33.2,35.0],37:[32.0,33.9,35.7],38:[32.6,34.5,36.4],39:[33.1,35.0,37.0],
     40:[33.6,35.5,37.5]},
  F:{24:[21.0,22.0,23.1],25:[21.9,23.0,24.1],26:[22.9,24.0,25.1],27:[23.8,25.0,26.1],
     28:[24.6,25.9,27.2],29:[25.5,26.8,28.1],30:[26.3,27.7,29.0],31:[27.1,28.5,29.9],
     32:[27.9,29.3,30.7],33:[28.6,30.1,31.6],34:[29.4,30.9,32.4],35:[30.1,31.7,33.3],
     36:[30.8,32.4,34.0],37:[31.4,33.1,34.7],38:[31.9,33.7,35.5],39:[32.4,34.2,36.0],
     40:[32.9,34.8,36.7]}
};

// Intergrowth-21st
const IGR_PW = {
  M:{24:[381,454,610,766,839],25:[443,528,710,892,977],26:[513,612,820,1028,1127],
     27:[594,708,945,1182,1296],28:[722,839,1090,1341,1458],29:[833,966,1245,1524,1657],
     30:[953,1100,1415,1730,1877],31:[1088,1249,1600,1951,2112],32:[1259,1431,1800,2169,2341],
     33:[1451,1625,2015,2405,2579],34:[1662,1838,2250,2662,2838],35:[1891,2066,2500,2934,3109],
     36:[1985,2234,2765,3296,3545],37:[2190,2454,3040,3626,3890],38:[2362,2640,3290,3940,4218],
     39:[2480,2763,3450,4137,4420],40:[2616,2914,3550,4186,4484],41:[2688,2984,3620,4256,4552],
     42:[2742,3038,3680,4322,4618]},
  F:{24:[362,430,578,725,795],25:[420,500,673,845,925],26:[486,579,777,974,1069],
     27:[563,671,895,1120,1229],28:[685,795,1033,1270,1383],29:[790,915,1181,1444,1571],
     30:[904,1043,1342,1640,1780],31:[1032,1184,1518,1850,2007],32:[1195,1358,1710,2057,2222],
     33:[1378,1541,1913,2281,2449],34:[1577,1744,2137,2526,2697],35:[1796,1960,2374,2783,2954],
     36:[1885,2120,2625,3127,3367],37:[2081,2329,2888,3444,3701],38:[2241,2505,3122,3743,4016],
     39:[2353,2622,3277,3930,4196],40:[2485,2767,3370,3976,4250],41:[2551,2831,3434,4045,4320],
     42:[2603,2886,3488,4109,4384]}
};
const IGR_LW = {
  M:{24:[28.8,30.4,32.0],25:[30.2,31.9,33.6],26:[31.6,33.5,35.3],27:[33.0,35.0,37.0],
     28:[34.4,36.5,38.6],29:[35.7,38.0,40.2],30:[37.0,39.4,41.8],31:[38.3,40.8,43.3],
     32:[39.5,42.2,44.8],33:[40.7,43.5,46.3],34:[41.9,44.8,47.7],35:[43.0,46.0,49.1],
     36:[44.1,47.2,50.4],37:[45.1,48.3,51.6],38:[46.1,49.4,52.7],39:[47.0,50.4,53.8],
     40:[47.9,51.3,54.7],41:[48.6,52.1,55.5],42:[49.3,52.8,56.3]},
  F:{24:[28.2,29.7,31.2],25:[29.5,31.2,32.9],26:[30.9,32.7,34.5],27:[32.3,34.2,36.1],
     28:[33.6,35.7,37.8],29:[34.9,37.2,39.4],30:[36.2,38.6,41.0],31:[37.5,39.9,42.4],
     32:[38.7,41.2,43.8],33:[39.9,42.5,45.1],34:[41.0,43.8,46.5],35:[42.1,45.0,47.8],
     36:[43.2,46.1,49.1],37:[44.2,47.2,50.3],38:[45.1,48.2,51.4],39:[46.0,49.2,52.4],
     40:[46.8,50.1,53.4],41:[47.5,50.9,54.3],42:[48.2,51.6,55.1]}
};
const IGR_CW = {
  M:{24:[21.8,22.9,24.0],25:[22.8,23.9,25.1],26:[23.7,24.9,26.1],27:[24.6,25.9,27.1],
     28:[25.5,26.8,28.1],29:[26.3,27.7,29.1],30:[27.2,28.6,30.1],31:[28.0,29.5,31.0],
     32:[28.8,30.4,31.9],33:[29.5,31.2,32.8],34:[30.3,32.0,33.7],35:[31.0,32.8,34.5],
     36:[31.7,33.5,35.3],37:[32.3,34.2,36.0],38:[32.9,34.8,36.7],39:[33.4,35.4,37.3],
     40:[33.9,35.9,37.9],41:[34.3,36.3,38.4],42:[34.7,36.8,38.9]},
  F:{24:[21.3,22.4,23.5],25:[22.2,23.3,24.5],26:[23.1,24.3,25.5],27:[24.0,25.2,26.5],
     28:[24.8,26.2,27.5],29:[25.7,27.1,28.5],30:[26.5,27.9,29.4],31:[27.3,28.8,30.2],
     32:[28.0,29.6,31.1],33:[28.7,30.3,31.9],34:[29.4,31.1,32.7],35:[30.1,31.8,33.5],
     36:[30.7,32.5,34.2],37:[31.3,33.1,34.9],38:[31.9,33.7,35.5],39:[32.4,34.2,36.1],
     40:[32.8,34.8,36.7],41:[33.2,35.2,37.2],42:[33.6,35.6,37.7]}
};

// ─────────────────────────────────────────────────────────────────────────────
// FUNÇÕES UTILITÁRIAS
// ─────────────────────────────────────────────────────────────────────────────
function calcZ(x, L, M, S) {
  if (x <= 0 || M <= 0) return null;
  if (Math.abs(L) < 0.0001) return Math.log(x / M) / S;
  return (Math.pow(x / M, L) - 1) / (L * S);
}
function normCDF(z) {
  const p = 0.3275911;
  const a = [0.254829592,-0.284496736,1.421413741,-1.453152027,1.061405429];
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + p * x);
  let poly = 0;
  for (let i = 4; i >= 0; i--) poly = a[i] + poly * t;
  const erf = 1 - poly * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}
function zToPerc(z) {
  if (z === null) return null;
  return Math.round(normCDF(z) * 100 * 10) / 10;
}
function lmsLookup(table, ageM) {
  return table[Math.min(Math.max(Math.round(ageM), 0), 60)];
}
function getPretermPercs(table, gaW) {
  return table[Math.round(gaW)] || null;
}
function classify(perc) {
  if (perc === null) return null;
  if (perc < 10) return { label:"PIG", color:"#EF4444", bg:"#FEF2F2", text:"Pequeno para IG" };
  if (perc > 90) return { label:"GIG", color:"#F59E0B", bg:"#FFFBEB", text:"Grande para IG" };
  return { label:"AIG", color:"#10B981", bg:"#ECFDF5", text:"Adequado para IG" };
}
function classifyOMS(perc) {
  if (perc === null) return null;
  if (perc < 3)  return { label:"< P3",  color:"#EF4444", bg:"#FEF2F2" };
  if (perc < 10) return { label:"P3–10", color:"#F97316", bg:"#FFF7ED" };
  if (perc < 25) return { label:"P10–25",color:"#10B981", bg:"#ECFDF5" };
  if (perc < 50) return { label:"P25–50",color:"#10B981", bg:"#ECFDF5" };
  if (perc < 75) return { label:"P50–75",color:"#10B981", bg:"#ECFDF5" };
  if (perc < 90) return { label:"P75–90",color:"#10B981", bg:"#ECFDF5" };
  if (perc < 97) return { label:"P90–97",color:"#F97316", bg:"#FFF7ED" };
  return { label:"> P97", color:"#EF4444", bg:"#FEF2F2" };
}
function percFromBand3(val, band) {
  if (!band || val === null || val === "") return null;
  const v = parseFloat(val);
  if (isNaN(v)) return null;
  if (v < band[0]) return 8;
  if (v < band[1]) return 30;
  if (v < band[2]) return 70;
  return 92;
}
function percFromBand5(val, band) {
  if (!band || val === null || val === "") return null;
  const v = parseFloat(val);
  if (isNaN(v)) return null;
  if (v < band[0]) return 1;
  if (v < band[1]) return 5;
  if (v < band[2]) return 30;
  if (v < band[3]) return 70;
  if (v < band[4]) return 95;
  return 99;
}
function parseNum(s) {
  if (!s) return null;
  const n = parseFloat(String(s).replace(",", "."));
  return isNaN(n) ? null : n;
}

// Conversão percentil → Z aproximado (para tabelas pré-termo)
// Valores derivados da distribuição normal padrão
const PERC_Z_MAP = {1:-2.33, 5:-1.64, 8:-1.41, 30:-0.52, 70:0.52, 92:1.41, 95:1.64, 99:2.33};
function percToZ(p) {
  if (p === null) return null;
  return PERC_Z_MAP[p] !== undefined ? PERC_Z_MAP[p].toFixed(2) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTES — definidos FORA do componente principal
// (Evita re-mount a cada re-render → corrige perda de foco no mobile)
// ─────────────────────────────────────────────────────────────────────────────

function PercBar({ perc, color }) {
  const p = Math.min(Math.max(perc || 50, 0), 100);
  return (
    <div style={{ marginTop:"8px", position:"relative", height:"6px", borderRadius:"3px", background:"#E5E7EB" }}>
      {[3,10,25,50,75,90,97].map(m => (
        <div key={m} style={{ position:"absolute", left:`${m}%`, top:"-2px", width:"2px", height:"10px", background:"#D1D5DB" }} />
      ))}
      <div style={{ position:"absolute", left:`${p}%`, top:"-4px", width:"14px", height:"14px",
        borderRadius:"50%", background:color, transform:"translateX(-50%)", boxShadow:"0 0 0 2px white" }} />
    </div>
  );
}

function SexoBtn({ val, cur, set }) {
  const a = val === cur;
  return (
    <button onClick={() => set(val)} style={{
      flex:1, padding:"8px", borderRadius:"8px", border:"none", cursor:"pointer",
      fontWeight: a ? "700" : "500",
      backgroundColor: a ? (val === "M" ? "#3B82F6" : "#EC4899") : "#F3F4F6",
      color: a ? "#FFFFFF" : "#374151",
    }}>
      {val === "M" ? "Masculino" : "Feminino"}
    </button>
  );
}

function Input({ label, val, set, ph, unit }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
      <label style={{ fontSize:"13px", fontWeight:"600", color:"#374151" }}>
        {label}{unit && <span style={{ fontWeight:"400", color:"#9CA3AF" }}> ({unit})</span>}
      </label>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={val}
        onChange={e => set(e.target.value)}
        placeholder={ph}
        style={{
          padding:"10px 12px", borderRadius:"8px",
          border:"1.5px solid #E5E7EB", fontSize:"16px",
          outline:"none", width:"100%", boxSizing:"border-box",
          background:"#fff",
        }}
      />
    </div>
  );
}

function CardOMS({ label, data }) {
  if (!data) return null;
  const { z, perc, cl, val } = data;
  return (
    <div style={{ borderRadius:"10px", border:`1.5px solid ${cl.color}`, background:cl.bg, padding:"12px", marginBottom:"8px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontWeight:"700", color:"#111827", fontSize:"15px" }}>{label}</span>
        <span style={{ fontWeight:"800", color:cl.color, fontSize:"18px" }}>{cl.label}</span>
      </div>
      <div style={{ marginTop:"8px", display:"flex", gap:"16px", flexWrap:"wrap" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.04em" }}>Valor</div>
          <div style={{ fontSize:"15px", fontWeight:"700", color:"#111827" }}>{val}</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.04em" }}>Z-score</div>
          <div style={{ fontSize:"15px", fontWeight:"700", color: parseFloat(z) < -2 || parseFloat(z) > 2 ? cl.color : "#111827" }}>{z}</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.04em" }}>Percentil</div>
          <div style={{ fontSize:"15px", fontWeight:"700", color:cl.color }}>P{perc?.toFixed(1)}</div>
        </div>
      </div>
      <PercBar perc={perc} color={cl.color} />
    </div>
  );
}

function CardPT({ label, data }) {
  if (!data) return null;
  const { perc, z, cl, val, band } = data;
  const bandTxt = band?.length === 5
    ? `P3:${band[0]} · P10:${band[1]} · P50:${band[2]} · P90:${band[3]} · P97:${band[4]}`
    : band ? `P10:${band[0]} · P50:${band[1]} · P90:${band[2]}` : "";
  return (
    <div style={{ borderRadius:"10px", border:`1.5px solid ${cl.color}`, background:cl.bg, padding:"12px", marginBottom:"8px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontWeight:"700", color:"#111827", fontSize:"15px" }}>{label}</span>
        <div style={{ textAlign:"right" }}>
          <span style={{ fontWeight:"800", color:cl.color, fontSize:"18px" }}>{cl.label}</span>
          <span style={{ fontSize:"11px", color:cl.color, display:"block" }}>{cl.text}</span>
        </div>
      </div>
      <div style={{ marginTop:"8px", display:"flex", gap:"16px", flexWrap:"wrap" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.04em" }}>Valor</div>
          <div style={{ fontSize:"15px", fontWeight:"700", color:"#111827" }}>{val}</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.04em" }}>Z-score</div>
          <div style={{ fontSize:"15px", fontWeight:"700", color: z && (parseFloat(z) < -1.28 || parseFloat(z) > 1.28) ? cl.color : "#111827" }}>
            {z ? `~${z}` : '—'}
          </div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.04em" }}>Percentil</div>
          <div style={{ fontSize:"15px", fontWeight:"700", color:cl.color }}>≈P{perc}</div>
        </div>
      </div>
      <div style={{ marginTop:"4px", fontSize:"11px", color:"#9CA3AF" }}>{bandTxt}</div>
      <PercBar perc={perc} color={cl.color} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function Percentis({ somenteOMS = false }) {
  const [tab, setTab] = useState(0);
  const TABS = somenteOMS ? ["OMS (0–60m)"] : ["OMS (0–60m)", "Intergrowth", "Fenton 2013"];

  // OMS
  const [oSexo, setOSexo]     = useState("M");
  const [oAnos, setOAnos]     = useState("");
  const [oMeses, setOMeses]   = useState("");
  const [oPeso, setOPeso]     = useState("");
  const [oAltura, setOAltura] = useState("");
  const [oPc, setOPc]         = useState("");
  const [oRes, setORes]       = useState(null);

  // Pré-termo
  const [pSexo, setPSexo]   = useState("M");
  const [pIg, setPIg]       = useState("");
  const [pPeso, setPPeso]   = useState("");
  const [pComp, setPComp]   = useState("");
  const [pPc, setPPc]       = useState("");
  const [pRes, setPRes]     = useState(null);

  function calcOMS() {
    const anos  = parseNum(oAnos)  || 0;
    const meses = parseNum(oMeses) || 0;
    const idade = Math.round(anos * 12 + meses);
    if (idade < 0 || idade > 60) { alert("Idade: 0–60 meses"); return; }

    const tabP = oSexo === "M" ? WHO_PM : WHO_PF;
    const tabH = oSexo === "M" ? WHO_HM : WHO_HF;
    const tabC = oSexo === "M" ? WHO_CM : WHO_CF;

    const lmsP = lmsLookup(tabP, idade);
    const lmsH = lmsLookup(tabH, idade);
    const lmsC = lmsLookup(tabC, idade);

    const peso   = parseNum(oPeso);
    const altura = parseNum(oAltura);
    const pc     = parseNum(oPc);

    const zP = peso   ? calcZ(peso,   lmsP[0], lmsP[1], lmsP[2]) : null;
    const zH = altura ? calcZ(altura, lmsH[0], lmsH[1], lmsH[2]) : null;
    const zC = pc     ? calcZ(pc,     lmsC[0], lmsC[1], lmsC[2]) : null;

    setORes({
      idade,
      peso:   peso   ? { z: zP?.toFixed(2), perc: zToPerc(zP), cl: classifyOMS(zToPerc(zP)), val: peso }   : null,
      altura: altura ? { z: zH?.toFixed(2), perc: zToPerc(zH), cl: classifyOMS(zToPerc(zH)), val: altura } : null,
      pc:     pc     ? { z: zC?.toFixed(2), perc: zToPerc(zC), cl: classifyOMS(zToPerc(zC)), val: pc }     : null,
    });
  }

  function calcPreterm(isPW) {
    const ig  = parseNum(pIg);
    const min = 24, max = isPW ? 42 : 40;
    if (!ig || ig < min || ig > max) { alert(`IG: ${min}–${max} semanas`); return; }
    const igW    = Math.round(ig);
    const tabPW  = isPW ? IGR_PW : FEN_PW;
    const tabLW  = isPW ? IGR_LW : FEN_LW;
    const tabCW  = isPW ? IGR_CW : FEN_CW;
    const bandP  = getPretermPercs(tabPW[pSexo], igW);
    const bandL  = getPretermPercs(tabLW[pSexo], igW);
    const bandC  = getPretermPercs(tabCW[pSexo], igW);
    const pesoG  = parseNum(pPeso);
    const compCm = parseNum(pComp);
    const pcCm   = parseNum(pPc);
    const percP  = pesoG  ? percFromBand5(pesoG,  bandP) : null;
    const percL  = compCm ? percFromBand3(compCm, bandL) : null;
    const percC  = pcCm   ? percFromBand3(pcCm,   bandC) : null;
    setPRes({
      ig: igW,
      peso:  pesoG  ? { perc:percP, z:percToZ(percP), cl:classify(percP), val:pesoG,  band:bandP } : null,
      comp:  compCm ? { perc:percL, z:percToZ(percL), cl:classify(percL), val:compCm, band:bandL } : null,
      pc:    pcCm   ? { perc:percC, z:percToZ(percC), cl:classify(percC), val:pcCm,   band:bandC } : null,
    });
  }

  const tabStyle = (i) => ({
    padding:"8px 0", borderRadius:"8px", fontSize:"13px",
    fontWeight: tab === i ? "700" : "500",
    backgroundColor: tab === i ? "#3B82F6" : "transparent",
    color: tab === i ? "#FFFFFF" : "#6B7280",
    border:"none", cursor:"pointer", flex:1,
  });

  const idadeM = Math.round(((parseNum(oAnos)||0)*12) + (parseNum(oMeses)||0));

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", maxWidth:"480px", margin:"0 auto",
      padding:"16px", backgroundColor:"#F9FAFB", minHeight:"100vh" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
        <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"#EFF6FF",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Scale size={24} color="#3B82F6" />
        </div>
        <div>
          <h1 style={{ margin:0, fontSize:"20px", fontWeight:"800", color:"#111827" }}>Curvas de Crescimento</h1>
          <p style={{ margin:0, fontSize:"12px", color:"#6B7280" }}>
            {somenteOMS ? "OMS — Organização Mundial da Saúde · 0–60 meses" : "OMS · Intergrowth-21st · Fenton 2013"}
          </p>
        </div>
      </div>

      {/* Tabs (ocultas no modo somente OMS) */}
      {!somenteOMS && (
        <div style={{ display:"flex", gap:"4px", background:"#E5E7EB", borderRadius:"10px",
          padding:"4px", marginBottom:"20px" }}>
          {TABS.map((t, i) => (
            <button key={i} style={tabStyle(i)}
              onClick={() => { setTab(i); setORes(null); setPRes(null); }}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* ─── Tab OMS ─── */}
      {tab === 0 && (
        <div>
          <div style={{ background:"#fff", borderRadius:"12px", padding:"16px", marginBottom:"16px",
            boxShadow:"0 1px 3px rgba(0,0,0,0.08)" }}>
            <p style={{ margin:"0 0 12px", fontWeight:"700", color:"#374151", fontSize:"14px" }}>Sexo</p>
            <div style={{ display:"flex", gap:"8px" }}>
              <SexoBtn val="M" cur={oSexo} set={s => { setOSexo(s); setORes(null); }} />
              <SexoBtn val="F" cur={oSexo} set={s => { setOSexo(s); setORes(null); }} />
            </div>
          </div>

          <div style={{ background:"#fff", borderRadius:"12px", padding:"16px", marginBottom:"16px",
            boxShadow:"0 1px 3px rgba(0,0,0,0.08)" }}>
            <p style={{ margin:"0 0 12px", fontWeight:"700", color:"#374151", fontSize:"14px" }}>Idade</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <Input label="Anos"  val={oAnos}  set={setOAnos}  ph="0–5"  unit="" />
              <Input label="Meses" val={oMeses} set={setOMeses} ph="0–11" unit="" />
            </div>
            <p style={{ margin:"8px 0 0", fontSize:"12px", color:"#9CA3AF" }}>
              Total: {idadeM} meses
            </p>
          </div>

          <div style={{ background:"#fff", borderRadius:"12px", padding:"16px", marginBottom:"16px",
            boxShadow:"0 1px 3px rgba(0,0,0,0.08)" }}>
            <p style={{ margin:"0 0 12px", fontWeight:"700", color:"#374151", fontSize:"14px" }}>
              Medidas (pelo menos uma)
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <Input label="Peso" val={oPeso} set={setOPeso} ph="ex: 10,5" unit="kg" />
              <Input
                label={idadeM < 24 ? "Comprimento (deitado)" : "Estatura (em pé)"}
                val={oAltura} set={setOAltura} ph="ex: 75,0" unit="cm"
              />
              <Input label="PC" val={oPc} set={setOPc} ph="ex: 46,0" unit="cm" />
            </div>
          </div>

          <button onClick={calcOMS} style={{
            width:"100%", padding:"14px", borderRadius:"12px", border:"none",
            background:"#3B82F6", color:"#FFFFFF", fontSize:"16px", fontWeight:"700", cursor:"pointer",
          }}>
            Calcular Percentis
          </button>

          {oRes && (
            <div style={{ marginTop:"20px" }}>
              <h3 style={{ margin:"0 0 12px", fontSize:"15px", fontWeight:"700", color:"#374151" }}>
                Resultado — {oRes.idade}m · {oSexo === "M" ? "Menino" : "Menina"}
              </h3>
              <CardOMS label="Peso" data={oRes.peso} />
              <CardOMS label={idadeM < 24 ? "Comprimento" : "Estatura"} data={oRes.altura} />
              <CardOMS label="Perímetro Cefálico" data={oRes.pc} />
              <div style={{ background:"#EFF6FF", borderRadius:"10px", padding:"10px", marginTop:"8px",
                display:"flex", gap:"8px", alignItems:"flex-start" }}>
                <Info size={14} color="#3B82F6" style={{ marginTop:"1px", flexShrink:0 }} />
                <p style={{ margin:0, fontSize:"12px", color:"#1D4ED8" }}>
                  OMS: Z &lt; −2 = risco nutricional (abaixo P3). Z &gt; +2 = sobrepeso (acima P97). Avaliar tendência longitudinal.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab Intergrowth ─── */}
      {!somenteOMS && tab === 1 && (
        <PretermTab
          sexo={pSexo} setSexo={v => { setPSexo(v); setPRes(null); }}
          ig={pIg}     setIg={setPIg}
          peso={pPeso} setPeso={setPPeso}
          comp={pComp} setComp={setPComp}
          pc={pPc}     setPc={setPPc}
          calc={() => calcPreterm(true)}
          res={pRes}
          igRange="24–42 semanas"
          titulo="Intergrowth-21st"
          subtitulo="Villar J et al. Lancet 2014"
        />
      )}

      {/* ─── Tab Fenton ─── */}
      {!somenteOMS && tab === 2 && (
        <PretermTab
          sexo={pSexo} setSexo={v => { setPSexo(v); setPRes(null); }}
          ig={pIg}     setIg={setPIg}
          peso={pPeso} setPeso={setPPeso}
          comp={pComp} setComp={setPComp}
          pc={pPc}     setPc={setPPc}
          calc={() => calcPreterm(false)}
          res={pRes}
          igRange="24–40 semanas"
          titulo="Fenton 2013"
          subtitulo="Fenton TR & Kim JH. BMC Pediatrics 2013"
        />
      )}

      {/* Disclaimer */}
      <div style={{ marginTop:"24px", padding:"12px", background:"#F3F4F6", borderRadius:"10px",
        borderLeft:"3px solid #9CA3AF" }}>
        <p style={{ margin:0, fontSize:"11px", color:"#6B7280", lineHeight:"1.5" }}>
          <strong>Apoio à decisão clínica.</strong> Não substitui julgamento médico nem protocolo institucional.
          Valores derivados das publicações originais (OMS 2006, Intergrowth-21st 2014, Fenton 2013).
          Z-scores em tabelas pré-termo são aproximações derivadas dos percentis de referência.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente para abas pré-termo
// ─────────────────────────────────────────────────────────────────────────────
function PretermTab({ sexo, setSexo, ig, setIg, peso, setPeso, comp, setComp, pc, setPc,
                      calc, res, igRange, titulo, subtitulo }) {
  return (
    <div>
      <div style={{ background:"#fff", borderRadius:"12px", padding:"16px", marginBottom:"16px",
        boxShadow:"0 1px 3px rgba(0,0,0,0.08)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
          <p style={{ margin:0, fontWeight:"700", color:"#374151", fontSize:"14px" }}>{titulo}</p>
          <span style={{ fontSize:"11px", color:"#9CA3AF" }}>{subtitulo}</span>
        </div>
        <p style={{ margin:"0 0 12px", fontWeight:"700", color:"#374151", fontSize:"14px" }}>Sexo</p>
        <div style={{ display:"flex", gap:"8px" }}>
          <SexoBtn val="M" cur={sexo} set={setSexo} />
          <SexoBtn val="F" cur={sexo} set={setSexo} />
        </div>
      </div>

      <div style={{ background:"#fff", borderRadius:"12px", padding:"16px", marginBottom:"16px",
        boxShadow:"0 1px 3px rgba(0,0,0,0.08)" }}>
        <p style={{ margin:"0 0 12px", fontWeight:"700", color:"#374151", fontSize:"14px" }}>
          Dados ao nascimento
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <Input label={`IG ao nascimento (${igRange})`} val={ig}   set={setIg}   ph="ex: 30"   unit="semanas" />
          <Input label="Peso ao nascimento"              val={peso}  set={setPeso} ph="ex: 1500" unit="g"       />
          <Input label="Comprimento"                     val={comp}  set={setComp} ph="ex: 38,0" unit="cm"      />
          <Input label="Perímetro Cefálico"              val={pc}    set={setPc}   ph="ex: 27,0" unit="cm"      />
        </div>
      </div>

      <button onClick={calc} style={{
        width:"100%", padding:"14px", borderRadius:"12px", border:"none",
        background:"#8B5CF6", color:"#FFFFFF", fontSize:"16px", fontWeight:"700", cursor:"pointer",
      }}>
        Classificar
      </button>

      {res && (
        <div style={{ marginTop:"20px" }}>
          <h3 style={{ margin:"0 0 12px", fontSize:"15px", fontWeight:"700", color:"#374151" }}>
            Resultado — {res.ig} semanas · {sexo === "M" ? "Menino" : "Menina"}
          </h3>
          <CardPT label="Peso"               data={res.peso} />
          <CardPT label="Comprimento"        data={res.comp} />
          <CardPT label="Perímetro Cefálico" data={res.pc}   />
          <div style={{ background:"#F5F3FF", borderRadius:"10px", padding:"10px", marginTop:"8px",
            display:"flex", gap:"8px", alignItems:"flex-start" }}>
            <Info size={14} color="#8B5CF6" style={{ marginTop:"1px", flexShrink:0 }} />
            <p style={{ margin:0, fontSize:"12px", color:"#6D28D9" }}>
              <strong>AIG</strong> (P10–P90) · <strong>PIG</strong> (&lt;P10) · <strong>GIG</strong> (&gt;P90).
              Z-score aproximado derivado dos percentis de faixa. Classificação por peso tem maior relevância clínica.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
