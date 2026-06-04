/**
 * Representasi sebuah kelereng
 */
class Marble {
    constructor(id, weight) {
        this.id = id;
        this.weight = weight; // dalam gram
    }
}

/**
 * Representasi Timbangan Neraca Dua Lengan
 */
class BalanceScale {
    constructor() {
        this.weighingCount = 0;
    }

    /**
     * Menimbang dua kelompok kelereng
     * @param {Marble[]} leftGroup 
     * @param {Marble[]} rightGroup 
     * @returns {number} -1 jika kiri lebih berat, 1 jika kanan lebih berat, 0 jika seimbang
     */
    weigh(leftGroup, rightGroup) {
        this.weighingCount++;
        
        const leftTotalWeight = leftGroup.reduce((sum, m) => sum + m.weight, 0);
        const rightTotalWeight = rightGroup.reduce((sum, m) => sum + m.weight, 0);

        console.log(`\n[Penimbangan ke-${this.weighingCount}]`);
        console.log(`Lengan Kiri  (Isi: ${leftGroup.map(m => m.id).join(', ')}) -> Total: ${leftTotalWeight}g`);
        console.log(`Lengan Kanan (Isi: ${rightGroup.map(m => m.id).join(', ')}) -> Total: ${rightTotalWeight}g`);

        if (leftTotalWeight > rightTotalWeight) {
            console.log("👉 Hasil: Lengan KIRI lebih berat (turun)");
            return -1;
        } else if (rightTotalWeight > leftTotalWeight) {
            console.log("👉 Hasil: Lengan KANAN lebih berat (turun)");
            return 1;
        } else {
            console.log("👉 Hasil: SEIMBANG");
            return 0;
        }
    }
}

/**
 * Solusi Pencarian Kelereng Terberat
 */
class MarbleSolver {
    constructor() {
        this.scale = new BalanceScale();
    }

    /**
     * Menemukan kelereng terberat dari array berisi 8 kelereng
     * @param {Marble[]} marbles 
     * @returns {Marble} kelereng terberat
     */
    findHeaviest(marbles) {
        if (marbles.length !== 8) {
            throw new Error("Algoritma ini dikhususkan untuk 8 kelereng");
        }

        console.log("=== Memulai Pencarian Kelereng Terberat ===");

        // --- PENIMBANGAN 1: Bagi menjadi kelompok 3-3-2 ---
        const groupA = marbles.slice(0, 3); // Kelereng 1, 2, 3
        const groupB = marbles.slice(3, 6); // Kelereng 4, 5, 6
        const groupC = marbles.slice(6, 8); // Kelereng 7, 8 (Ditaruh di luar)

        const result1 = this.scale.weigh(groupA, groupB);

        let candidateGroup = [];

        if (result1 === -1) {
            // Kiri lebih berat, maka kelereng target ada di Group A (3 kelereng)
            candidateGroup = groupA;
        } else if (result1 === 1) {
            // Kanan lebih berat, maka kelereng target ada di Group B (3 kelereng)
            candidateGroup = groupB;
        } else {
            // Seimbang, maka kelereng target pasti ada di luar (Group C - 2 kelereng)
            candidateGroup = groupC;
        }

        // --- PENIMBANGAN 2: Ambil dari kelompok kandidat ---
        console.log(`\nKelereng target terisolasi di kandidat berisi ${candidateGroup.length} kelereng.`);

        if (candidateGroup.length === 2) {
            // Kasus jika kelereng ada di Group C (Sisa 2 kelereng)
            const result2 = this.scale.weigh([candidateGroup[0]], [candidateGroup[1]]);
            return result2 === -1 ? candidateGroup[0] : candidateGroup[1];
        } else {
            // Kasus jika kelereng ada di Group A atau B (Sisa 3 kelereng)
            // Ambil 2 kelereng untuk ditimbang (1 vs 1), 1 kelereng sisanya ditaruh di luar
            const subGroupLeft = [candidateGroup[0]];
            const subGroupRight = [candidateGroup[1]];
            const leftOutMarble = candidateGroup[2];

            const result2 = this.scale.weigh(subGroupLeft, subGroupRight);

            if (result2 === -1) {
                return candidateGroup[0]; // Kiri lebih berat
            } else if (result2 === 1) {
                return candidateGroup[1]; // Kanan lebih berat
            } else {
                return leftOutMarble; // Seimbang, berarti kelereng yang di luar adalah yang terberat
            }
        }
    }
}

// --- EKSEKUSI / JALANKAN SIMULASI ---

// Membuat 8 kelereng standar (7 kelereng 100g, dan kelereng ke-5 dibuat rusak/125g)
const daftarKelereng = [
    new Marble("Kelereng-1", 100),
    new Marble("Kelereng-2", 100),
    new Marble("Kelereng-3", 100),
    new Marble("Kelereng-4", 100),
    new Marble("Kelereng-5", 125), // <--- Ini kelereng terberatnya (Index ke-4)
    new Marble("Kelereng-6", 100),
    new Marble("Kelereng-7", 100),
    new Marble("Kelereng-8", 100)
];

const solver = new MarbleSolver();
const kelerengTerberat = solver.findHeaviest(daftarKelereng);

console.log("\n=== HASIL AKHIR ===");
console.log(`Kelereng terberat adalah: ${kelerengTerberat.id} dengan bobot ${kelerengTerberat.weight} gram.`);
console.log(`Total penimbangan yang dilakukan: ${solver.scale.weighingCount} kali.`);