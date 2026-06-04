### 1. Langkah Algoritma (Divide and Conquer)

Untuk menemukan 1 kelereng berbobot 125 gram dari total 8 kelereng (7 kelereng lainnya berbobot 100 gram) dengan maksimal 2 kali penimbangan, kita menggunakan prinsip pembagian kelompok **3-3-2**.

* **Penimbangan 1:** Ambil 6 kelereng secara acak, bagi menjadi dua lengan timbangan: **Kelompok A (3 kelereng)** vs **Kelompok B (3 kelereng)**. Sisa **Kelompok C (2 kelereng)** ditaruh di luar timbangan.
* **Kondisi 1.1 (Timbangan Seimbang):** Kelereng terberat berada di **Kelompok C** (2 kelereng yang di luar).
* **Kondisi 1.2 (Timbangan Berat Sebelah):** Kelereng terberat berada di kelompok lengan timbangan yang **turun/lebih rendah** (antara Kelompok A atau B).

* **Penimbangan 2:** Ambil kelompok yang terbukti berisi kelereng terberat dari Penimbangan 1.
* **Jika dari Kondisi 1.1 (Kelompok C - 2 kelereng):** Timbang 1 kelereng vs 1 kelereng. Kelereng yang turun adalah kelereng 125 gram.
* **Jika dari Kondisi 1.2 (Kelompok A/B - 3 kelereng):** Ambil 2 kelereng dari kelompok tersebut, timbang 1 vs 1. Satu kelereng sisanya ditaruh di luar.
* Jika seimbang, kelereng terberat adalah yang ditaruh di luar.
* Jika berat sebelah, kelereng yang turun adalah kelereng 125 gram.


### 2. Reasoning (Analisis Logika)

Pendekatan berbasis pohon keputusan terner (ternary decision tree) membuktikan bahwa informasi maksimum yang dapat diekstrak dari satu kali penimbangan neraca dua lengan adalah 3 status: **Kiri turun (-1), Seimbang (0), atau Kanan turun (1)**.
Dengan kapasitas $3^k$ di mana $k$ adalah jumlah penimbangan:

* 1 Kali penimbangan maksimal mendeteksi dari $3^1 = 3$ kelereng.
* 2 Kali penimbangan maksimal mendeteksi dari $3^2 = 9$ kelereng.
Karena jumlah total kelereng adalah 8 ($8 \le 9$), maka secara matematis **pasti bisa diselesaikan** dalam maksimal 2 kali penimbangan menggunakan pembagian basis 3 (ternary split).


### 3. Complexity Thinking

* **Time Complexity:** $\mathcal{O}(\log_3 n)$. Dalam kasus ini, dengan $n = 8$, jumlah operasi maksimal adalah $\lceil\log_3 8\rceil = 2$.
* **Space Complexity:** $\mathcal{O}(1)$ atau konstan karena alokasi memori/tempat objek statis dan tidak membutuhkan memori tambahan seiring bertambahnya variabel.