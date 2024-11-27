let users = JSON.parse(localStorage.getItem("users")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");
  const showLogin = document.getElementById("show-login");
  const showRegister = document.getElementById("show-register");
  

  const activeUser = JSON.parse(localStorage.getItem("activeUser"));
  if (activeUser && window.location.pathname.includes("index.html")) {
    alert(`Selamat datang kembali, ${activeUser.username}!`);
    window.location.href = "tabungan.html";
  }

  if (formRegister) {
    formRegister.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("register-username").value;
      const password = document.getElementById("register-password").value;

      if (users.some((user) => user.username === username)) {
        alert("Username sudah terdaftar!");
      } else {
        users.push({ username, password, savings: [] });
        localStorage.setItem("users", JSON.stringify(users));
        alert("Pendaftaran berhasil! Silakan login.");
        formRegister.reset();
        document.getElementById("register-form").classList.add("hidden");
        document.getElementById("login-form").classList.remove("hidden");
      }
    });
  }

  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;

      const user = users.find((u) => u.username === username && u.password === password);
      if (user) {
        localStorage.setItem("activeUser", JSON.stringify(user));
        window.location.href = "tabungan.html";
      } else {
        alert("Username atau password salah!");
      }
    });
  }

  if (showRegister) {
    showRegister.addEventListener("click", () => {
      document.getElementById("login-form").classList.add("hidden");
      document.getElementById("register-form").classList.remove("hidden");
    });
  }

  if (showLogin) {
    showLogin.addEventListener("click", () => {
      document.getElementById("register-form").classList.add("hidden");
      document.getElementById("login-form").classList.remove("hidden");
    });
  }

  if (window.location.pathname.includes("tabungan.html")) {
    if (!activeUser) {
      window.location.href = "index.html";
    }

    document.getElementById("welcome-message").textContent = `Selamat datang, ${activeUser.username}!`;


    const savingsList = document.getElementById("list-tabungan");
    const formTabungan = document.getElementById("simpan-tabungan");

    // Fungsi untuk menangani pengisian form tabungan
formTabungan.addEventListener("submit", (e) => {
  e.preventDefault();

  const namaTabungan = document.getElementById("nama-tabungan").value;
  const targetTabungan = document.getElementById("target-tabungan").value || null; // Bisa kosong
  const jumlahAwal = parseInt(document.getElementById("jumlah-awal").value.replace(/\D/g, '')) || 0; // Menghilangkan karakter non-numerik
  const tipeTabungan = document.getElementById("tipe-tabungan").value;
  const tanggalMulai = document.getElementById("tanggal-mulai").value;
  const waktuMulai = document.getElementById("waktu-mulai").value;
  const keterangan = document.getElementById("keterangan").value || "Tidak ada";
  const buktiTabungan = document.getElementById("bukti-tabungan").files[0];

  // Menghilangkan validasi jumlah awal tabungan minimal
  // Tidak ada validasi lagi pada jumlah awal

  const reader = new FileReader();
  reader.onload = function () {
    const buktiURL = reader.result;

    const newSaving = {
      namaTabungan,
      targetTabungan: targetTabungan ? targetTabungan : null, // Tidak ada format currency untuk target jika kosong
      jumlahAwal, // Menggunakan nilai jumlah awal dari form
      tipeTabungan,
      tanggalMulai,
      waktuMulai,
      keterangan,
      buktiURL,
    };

    activeUser.savings.push(newSaving);

    localStorage.setItem("activeUser", JSON.stringify(activeUser));
    users = users.map((user) =>
      user.username === activeUser.username ? activeUser : user
    );
    localStorage.setItem("users", JSON.stringify(users));

    updateSavingsList();
    formTabungan.reset();
  };

  if (buktiTabungan) {
    reader.readAsDataURL(buktiTabungan);
  }
});



    // Fungsi untuk toggle tampil/sembunyi detail
window.toggleDetails = (index) => {
  const detailsDiv = document.getElementById(`details-${index}`);
  const toggleButton = document.getElementById(`toggle-details-${index}`);

  // Mengecek status tampilan detail di localStorage
  const isDetailVisible = localStorage.getItem(`details-visible-${index}`) === 'true';

  // Jika detail tersembunyi, maka tampilkan detail dan ubah tombol
  if (!isDetailVisible) {
    detailsDiv.style.display = "block";
    toggleButton.textContent = "Sembunyikan Detail";
    // Simpan status detail tampil
    localStorage.setItem(`details-visible-${index}`, 'true');
  } else {
    // Jika detail sudah terlihat, sembunyikan dan ubah tombol
    detailsDiv.style.display = "none";
    toggleButton.textContent = "Tampilkan Detail";
    // Simpan status detail sembunyi
    localStorage.setItem(`details-visible-${index}`, 'false');
  }
};

// Update untuk menampilkan daftar tabungan dengan format mata uang
const updateSavingsList = () => {
  savingsList.innerHTML = ""; // Kosongkan list tabungan sebelumnya
  activeUser.savings.forEach((saving, index) => {
    const li = document.createElement("li");

    let setoranNumber = index + 1;

    const isDetailVisible = localStorage.getItem(`details-visible-${index}`) === 'true';
    
    // Hitung persentase pencapaian jika targetTabungan ada
    let persenPencapaian = 0;
    if (saving.targetTabungan) {
      persenPencapaian = Math.min(Math.floor((saving.jumlahAwal / parseInt(saving.targetTabungan.replace(/\D/g, ''))) * 100), 100);
    }

    li.innerHTML = `
      <strong>Bukti Setoran ${setoranNumber}:</strong><br>
      <img src="${saving.buktiURL}" alt="Bukti Tabungan" style="max-width: 100%; height: auto; margin-top: 10px;"><br>
      <button onclick="toggleDetails(${index})" id="toggle-details-${index}">Tampilkan Detail</button>
      <div id="details-${index}" style="display: ${isDetailVisible ? 'block' : 'none'}; margin-top: 10px;">
        <strong>Nama Tabungan:</strong> ${saving.namaTabungan}<br>
        <strong>Target Tabungan:</strong> ${saving.targetTabungan ? saving.targetTabungan : "Tidak ditentukan"}<br>
        <strong>Jumlah Tabungan:</strong> ${formatCurrency(saving.jumlahAwal)}<br>
        ${saving.targetTabungan ? `
        <strong>Persentase Pencapaian:</strong> ${persenPencapaian}% - ${persenPencapaian < 100 ? "Kurang dari target tabungan" : "Terkumpul penuh"}<br>
        ` : ''}
        <strong>Tipe:</strong> ${saving.tipeTabungan}<br>
        <strong>Mulai:</strong> ${saving.tanggalMulai} (${saving.waktuMulai})<br>
        <strong>Keterangan:</strong> ${saving.keterangan}<br>
        <button onclick="tambahTabungan(${index})">Tambah Tabungan</button><br>
        <button onclick="ambilTabungan(${index})">Ambil Tabungan</button><br>
        <button onclick="hapusTabungan(${index})">Hapus</button><br>
      </div>
      <hr>
    `;
    savingsList.appendChild(li);
  });
};



window.tambahTabungan = (index) => {
  const saving = activeUser.savings[index];

  // Mendapatkan tanggal dan waktu saat ini di zona waktu WIB
  const currentDate = new Date();

  // Format tanggal
  const formattedDate = currentDate.toLocaleDateString();

  // Format waktu 24 jam di zona waktu WIB
  const options = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' };
  const formattedTime = new Intl.DateTimeFormat('id-ID', options).format(currentDate); // Format waktu mengikuti WIB

  // Prompt untuk jumlah yang ingin ditambahkan
  const jumlahTambah = parseInt(
    prompt(`Masukkan jumlah yang ingin ditambahkan ke tabungan (Contoh isi : 100.000) "${saving.namaTabungan}":`, 0)
      .replace(/[^0-9]/g, ""), // Menghapus karakter non-numerik
    10
  );

  // Prompt untuk keterangan penambahan
  const keteranganTambah =
    prompt(`Masukkan keterangan untuk penambahan:`, "Jika ada keterangan, silahkan diisi") || "Tidak ada keterangan";

  // Validasi input
  if (isNaN(jumlahTambah) || jumlahTambah <= 0) {
    alert("Masukkan jumlah yang valid!");
    return;
  }

  // Tambahkan jumlah ke saldo
  saving.jumlahAwal += jumlahTambah;

  // Tambahkan catatan ke keterangan tabungan dengan tanggal dan jam
saving.keterangan += `<br><strong>Tambah Jumlah Tabungan:</strong><br> ${formatCurrency(jumlahTambah)}<br>${keteranganTambah}<br> ${formattedDate}<br> ${formattedTime}`;


  // Simpan pembaruan ke localStorage
  localStorage.setItem("activeUser", JSON.stringify(activeUser));
  users = users.map((user) =>
    user.username === activeUser.username ? activeUser : user
  );
  localStorage.setItem("users", JSON.stringify(users));

  // Perbarui tampilan daftar tabungan
  updateSavingsList();

  alert(`Berhasil menambahkan ${formatCurrency(jumlahTambah)} ke "${saving.namaTabungan}". Keterangan: ${keteranganTambah}`);
};



// Fungsi utilitas untuk memformat angka ke Rupiah
// Fungsi utilitas untuk memformat angka ke Rupiah
function formatCurrency(value) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" }).replace(/,00$/, "");
}



    updateSavingsList();

    window.hapusTabungan = (index) => {
      if (confirm("Apakah Anda yakin ingin menghapus tabungan ini?")) {
        activeUser.savings.splice(index, 1);
        localStorage.setItem("activeUser", JSON.stringify(activeUser));
        users = users.map((user) =>
          user.username === activeUser.username ? activeUser : user
        );
        localStorage.setItem("users", JSON.stringify(users));
        updateSavingsList();
      }
    };

 
    window.ambilTabungan = (index) => {
      const saving = activeUser.savings[index];
  
      // Mendapatkan tanggal dan waktu saat ini di zona waktu WIB
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString(); // Format tanggal
  
      // Format waktu 24 jam di zona waktu WIB
      const options = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' };
      const formattedTime = new Intl.DateTimeFormat('id-ID', options).format(currentDate); // Format waktu 24 jam WIB
  
      // Prompt untuk jumlah yang ingin diambil
      const jumlahAmbil = parseInt(
          prompt(`Masukkan jumlah yang ingin diambil dari tabungan (Contoh isi = 100.000)  "${saving.namaTabungan}":`, 0)
              .replace(/[^0-9]/g, ""), // Menghapus karakter non-numerik
          10
      );
  
      // Prompt untuk keterangan penarikan
      const keteranganAmbil =
          prompt(`Masukkan keterangan untuk penarikan:`, "Jika ada kebutuhan silahkan di isi") || "Tidak ada keterangan";
  
      // Validasi input
      if (isNaN(jumlahAmbil) || jumlahAmbil <= 0) {
          alert("Masukkan jumlah yang valid!");
          return;
      }
  
      // Validasi jumlah yang diambil tidak melebihi saldo
      if (jumlahAmbil > saving.jumlahAwal) {
          alert("Jumlah yang diambil melebihi saldo!");
          return;
      }
  
      // Proses pengurangan saldo
      saving.jumlahAwal -= jumlahAmbil;
  
      // Tambahkan catatan ke keterangan tabungan dengan tanggal dan jam
     // Tambahkan catatan ke keterangan tabungan untuk ambil tabungan dengan tanggal dan jam
saving.keterangan += `<br><strong>Ambil Tabungan:</strong><br> ${formatCurrency(jumlahAmbil)}<br>${keteranganAmbil}<br> ${formattedDate}<br> ${formattedTime}`;

  
      // Simpan pembaruan ke localStorage
      localStorage.setItem("activeUser", JSON.stringify(activeUser));
      users = users.map((user) =>
          user.username === activeUser.username ? activeUser : user
      );
      localStorage.setItem("users", JSON.stringify(users));
  
      // Perbarui tampilan daftar tabungan
      updateSavingsList();
  
      alert(`Berhasil mengambil ${formatCurrency(jumlahAmbil)} dari "${saving.namaTabungan}". Keterangan: ${keteranganAmbil}`);
  };
  
      
      // Fungsi utilitas untuk memformat angka ke Rupiah
      function formatCurrency(value) {
        return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" }).replace(/,00$/, "");
      }
      

    
    document.getElementById("logout").addEventListener("click", () => {
      localStorage.removeItem("activeUser");
      window.location.href = "index.html";
    });
  }
});

let isConfirmed = false; // Variabel untuk memastikan data hanya disimpan jika OK diklik

function tampilkanNotifikasi() {
  const modal = document.getElementById('notifikasi-modal');
  modal.style.display = 'flex'; // Tampilkan modal
}

function tutupNotifikasi() {
  const modal = document.getElementById('notifikasi-modal');
  modal.style.display = 'none'; // Sembunyikan modal
  isConfirmed = false; // Set kembali ke false jika batal
}

function konfirmasiSimpan() {
  isConfirmed = true; // Menandakan data akan disimpan
  alert('Data berhasil disimpan!'); // Tampilkan pesan konfirmasi
  tutupNotifikasi(); // Tutup modal setelah menyimpan
  // Kode untuk menyimpan data, misalnya submit form
  // document.getElementById('form-id').submit(); // Gantilah dengan ID form yang sesuai
}


// Fungsi untuk format input yang diubah menjadi format mata uang
document.getElementById("target-tabungan").addEventListener("input", function(e) {
  formatCurrencyInput(e.target);
});

document.getElementById("jumlah-awal").addEventListener("input", function(e) {
  formatCurrencyInput(e.target);
});

// Fungsi untuk memformat input ke format mata uang
function formatCurrencyInput(input) {
  let value = input.value.replace(/\D/g, ''); // Hapus non-digit
  if (value) {
    input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Format dengan titik ribuan
  } else {
    input.value = '';
  }
}
