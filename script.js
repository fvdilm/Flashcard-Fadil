let currentCardIndex = 0;
let correctAnswers = 0;
let answeredFlashcards = new Map(); // Menggunakan Map untuk menyimpan status benar/salah

// Fungsi untuk toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

// Fungsi untuk toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// Fungsi untuk menambahkan flashcard
function addFlashcard() {
    const questionText = document.getElementById('questionText').value.trim();
    const questionImage = document.getElementById('questionImage').files[0];
    const answerText = document.getElementById('answerText').value.trim();
    const answerImage = document.getElementById('answerImage').files[0];

    if (!questionText && !questionImage && !answerText && !answerImage) {
        alert('Form tidak boleh kosong.');
        return;
    }

    const flashcard = {
        questionText,
        questionImage: questionImage ? URL.createObjectURL(questionImage) : null,
        answerText,
        answerImage: answerImage ? URL.createObjectURL(answerImage) : null,
    };

    // Ambil flashcards dari localStorage, atau buat array baru jika belum ada
    let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    flashcards.push(flashcard);

    // Simpan flashcards yang telah diperbarui ke localStorage
    localStorage.setItem('flashcards', JSON.stringify(flashcards));

    // Render flashcards
    renderAllFlashcards();

    // Reset form hanya jika checkbox 'Reset Form' dicentang
    const resetCheckbox = document.getElementById('resetForm');
    if (resetCheckbox.checked) {
        resetForm();
    }
}

// Fungsi reset form
function resetForm() {
    document.getElementById('questionText').value = '';
    document.getElementById('questionImage').value = '';
    document.getElementById('answerText').value = '';
    document.getElementById('answerImage').value = '';
}

// Fungsi untuk merender semua flashcards
function renderAllFlashcards() {
    // Ambil data flashcards dari localStorage
    let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    const flashcardDisplay = document.getElementById('flashcardDisplay');
    flashcardDisplay.innerHTML = '';

    // Render semua flashcard
    flashcards.forEach((flashcard, index) => {
        const flashcardElement = document.createElement('div');
        flashcardElement.className = 'col-md-4 flashcard';
        flashcardElement.innerHTML = `
            <div class="flashcard-inner" onclick="this.parentElement.classList.toggle('flipped')">
                <div class="flashcard-front">
                    ${flashcard.questionText ? `<p>${flashcard.questionText}</p>` : ''}
                    ${flashcard.questionImage ? `<img src="${flashcard.questionImage}" alt="Pertanyaan">` : ''}
                </div>
                <div class="flashcard-back">
                    ${flashcard.answerText ? `<p>${flashcard.answerText}</p>` : ''}
                    ${flashcard.answerImage ? `<img src="${flashcard.answerImage}" alt="Jawaban">` : ''}
                </div>
            </div>
            <button class="delete-btn" onclick="deleteFlashcard(${index})">&times;</button>
        `;
        flashcardDisplay.appendChild(flashcardElement);
    });
}

// Fungsi untuk menghapus flashcard
function deleteFlashcard(index) {
    // Ambil flashcards dari localStorage
    let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    flashcards.splice(index, 1);

    // Simpan ulang data flashcards ke localStorage
    localStorage.setItem('flashcards', JSON.stringify(flashcards));

    // Render flashcards setelah dihapus
    renderAllFlashcards();
}

// Fungsi untuk memulai sesi belajar
function startLearning() {
    let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    if (flashcards.length === 0) {
        alert('Tidak ada flashcards untuk dipelajari!');
        return;
    }

    currentCardIndex = 0;
    correctAnswers = 0;

    // Sembunyikan form, tetapi jangan ubah tombol "Mulai Belajar"
    document.getElementById('formContainer').style.display = 'none';

    renderLearningFlashcard();
}

// Fungsi untuk memuat flashcards dari localStorage saat halaman dimuat
function loadFlashcards() {
    renderAllFlashcards();
}

// Fungsi untuk merender flashcard dalam sesi belajar
function renderLearningFlashcard() {
    let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    const flashcardDisplay = document.getElementById('flashcardDisplay');
    flashcardDisplay.innerHTML = ''; // Hapus isi sebelumnya

    if (currentCardIndex < flashcards.length) {
        const flashcard = flashcards[currentCardIndex];
        const isAnswered = answeredFlashcards.has(currentCardIndex); // Periksa apakah flashcard sudah dijawab
        const feedback = answeredFlashcards.get(currentCardIndex) || {}; // Menampilkan feedback jika sudah dijawab

        const flashcardElement = document.createElement('div');
        flashcardElement.className = 'col-md-4 flashcard mx-auto';
        flashcardElement.id = `flashcard-${currentCardIndex}`;
        flashcardElement.innerHTML = `
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    ${flashcard.questionText ? `<p>${flashcard.questionText}</p>` : ''}
                    ${flashcard.questionImage ? `<img src="${flashcard.questionImage}" alt="Pertanyaan">` : ''}
                </div>
                <div class="flashcard-back">
                    ${flashcard.answerText ? `<p>${flashcard.answerText}</p>` : ''}
                    ${flashcard.answerImage ? `<img src="${flashcard.answerImage}" alt="Jawaban">` : ''}
                </div>
            </div>
            <div class="text-center mt-3">
                <input type="text" id="userAnswer" class="form-control input-blue" placeholder="Jawaban Anda" ${isAnswered ? 'disabled' : ''}>
                <p id="feedback" class="mt-2">${feedback.answered ? (feedback.correct ? 'Benar!' : 'Salah!') : ''}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    ${currentCardIndex > 0 ? `<button class="btn btn-primary" onclick="prevFlashcard()">&lt; Sebelumnya</button>` : ''}
                    <button id="submitAnswerBtn" class="btn btn-success" onclick="checkAnswer()" ${isAnswered ? 'disabled' : ''}>Submit Jawaban</button>
                    ${currentCardIndex < flashcards.length - 1 ? `<button class="btn btn-primary" onclick="nextFlashcard()">Berikutnya &gt;</button>` : ''}
                </div>
                <button class="btn btn-danger mt-3" onclick="endLearning()" id="endLearningBtn" ${answeredFlashcards.size === flashcards.length ? '' : 'disabled'}>Selesai</button>
            </div>
            <p class="text-center mt-3">Soal: ${currentCardIndex + 1} / ${flashcards.length} | Tersisa: ${flashcards.length - answeredFlashcards.size} | Belum Terjawab: ${flashcards.length - answeredFlashcards.size}</p>
        `;
        flashcardDisplay.appendChild(flashcardElement);
    } else {
        alert(`Belajar selesai! Anda menjawab ${correctAnswers} dari ${flashcards.length} dengan benar.`);
        endLearning();
    }
}

// Fungsi untuk berpindah ke flashcard berikutnya
function nextFlashcard() {
    let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    
    // Periksa apakah masih ada flashcard berikutnya
    if (currentCardIndex < flashcards.length - 1) {
        currentCardIndex++; // Pindah ke flashcard berikutnya
        renderLearningFlashcard(); // Render flashcard berikutnya
    }
}

// Fungsi untuk berpindah ke flashcard sebelumnya
function prevFlashcard() {
    if (currentCardIndex > 0) {
        currentCardIndex--; // Pindah ke flashcard sebelumnya
        renderLearningFlashcard(); // Render flashcard sebelumnya
    }
}

// Fungsi untuk mengakhiri sesi belajar
// Fungsi untuk mengakhiri sesi belajar
// Fungsi untuk mengakhiri sesi belajar
function endLearning() {
    alert(`Sesi belajar selesai. Anda menjawab ${correctAnswers} dari ${JSON.parse(localStorage.getItem('flashcards')).length} dengan benar.`);

    // Reset semua variabel
    currentCardIndex = 0;
    correctAnswers = 0;
    answeredFlashcards.clear();

    // Tampilkan form input kembali
    document.getElementById('formContainer').style.display = 'block';
    
    // Reset tampilan flashcard display
    const flashcardDisplay = document.getElementById('flashcardDisplay');
    flashcardDisplay.innerHTML = '';
    
    // Render ulang flashcards dalam tampilan normal
    let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    flashcards.forEach((flashcard, index) => {
        const flashcardElement = document.createElement('div');
        flashcardElement.className = 'col-md-4 flashcard';
        flashcardElement.innerHTML = `
            <div class="flashcard-inner" onclick="this.parentElement.classList.toggle('flipped')">
                <div class="flashcard-front">
                    ${flashcard.questionText ? `<p>${flashcard.questionText}</p>` : ''}
                    ${flashcard.questionImage ? `<img src="${flashcard.questionImage}" alt="Pertanyaan">` : ''}
                </div>
                <div class="flashcard-back">
                    ${flashcard.answerText ? `<p>${flashcard.answerText}</p>` : ''}
                    ${flashcard.answerImage ? `<img src="${flashcard.answerImage}" alt="Jawaban">` : ''}
                </div>
            </div>
            <button class="delete-btn" onclick="deleteFlashcard(${index})">&times;</button>
        `;
        flashcardDisplay.appendChild(flashcardElement);
    });

    // Pastikan mode tampilan kembali normal
    flashcardDisplay.style.display = 'flex';
    flashcardDisplay.style.flexWrap = 'wrap';
    flashcardDisplay.style.gap = '20px';
    
    // Reset semua modifikasi style yang mungkin ditambahkan selama sesi belajar
    document.querySelectorAll('.flashcard').forEach(card => {
        card.style = '';
    });
}

// Fungsi untuk memeriksa jawaban yang diberikan oleh pengguna
// Fungsi untuk memeriksa jawaban yang diberikan oleh pengguna
function checkAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.trim();
    let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [];
    const flashcard = flashcards[currentCardIndex];

    // Jika input jawaban kosong
    if (!userAnswer) {
        alert('Jawaban tidak boleh kosong!');
        return;
    }

    const feedback = document.getElementById('feedback');
    const isCorrect = userAnswer.toLowerCase() === flashcard.answerText.toLowerCase();

    // Menyimpan status benar/salah di answeredFlashcards
    answeredFlashcards.set(currentCardIndex, { answered: true, correct: isCorrect });

    // Menampilkan feedback: Benar atau Salah
    if (isCorrect) {
        correctAnswers++;
        feedback.textContent = 'Benar!';
        feedback.style.color = 'green';
    } else {
        feedback.textContent = 'Salah! Jawaban yang benar adalah: ' + flashcard.answerText;
        feedback.style.color = 'red';

        // Flip flashcard untuk menampilkan jawaban yang benar
        const flashcardElement = document.getElementById(`flashcard-${currentCardIndex}`);
        flashcardElement.querySelector('.flashcard-inner').classList.add('flipped');
    }

    // Menonaktifkan input jawaban dan tombol submit setelah jawaban diberikan
    document.getElementById('userAnswer').disabled = true;
    document.getElementById('submitAnswerBtn').disabled = true; // Tombol submit dinonaktifkan setelah dijawab

    // Periksa apakah semua flashcards telah dijawab
    if (answeredFlashcards.size === flashcards.length) {
        const endLearningBtn = document.getElementById('endLearningBtn');
        endLearningBtn.disabled = false; // Mengaktifkan tombol "Selesai" jika semua soal telah dijawab
    }
}

// Jalankan fungsi loadFlashcards saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadFlashcards);
