
document.getElementById("pdfFile").addEventListener("change", function () {
    const file = this.files[0];
    const preview = document.getElementById("previewBox");
    const embed = document.getElementById("pdfPreview");

    if (file && file.type === "application/pdf") {
        if (file.size > 2 * 1024 * 1024) {
            alert("File size exceeds 2MB!");
            this.value = "";
            preview.style.display = "none";
            return;
        }

        embed.src = URL.createObjectURL(file);
        preview.style.display = "block";
    } else {
        alert("Please select a valid PDF file.");
        this.value = "";
        preview.style.display = "none";
    }
});

document.getElementById("uploadForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData();
    const file = document.getElementById("pdfFile").files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    formData.append("pdfFile", file);

    fetch("/upload", {
        method: "POST",
        body: formData
    })
        .then(res => res.text())
        .then(() => {
            alert("Uploaded!");
            document.getElementById("pdfFile").value = "";
            document.getElementById("previewBox").style.display = "none";
            loadPDFList();
        });
});

function loadPDFList() {
    fetch("/files")
        .then(res => res.json())
        .then(files => {
            const list = document.getElementById("pdfList");
            list.innerHTML = "";
            files.forEach(file => {
                const li = document.createElement("li");
                const link = document.createElement("a");
                link.href = `/uploads/${file}`;
                link.textContent = file;
                link.target = "_blank";
                li.appendChild(link);
                list.appendChild(li);
            });
        });
}

window.onload = loadPDFList;
