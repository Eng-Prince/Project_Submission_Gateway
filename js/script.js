 const fileInput = document.getElementById("fileInput");
    const previewBox = document.getElementById("previewBox");
    const filePreview = document.getElementById("filePreview");
    let selectedFile = null;

    fileInput.addEventListener("change", function () {
      selectedFile = this.files[0];

      if (!selectedFile) return;

      const fileType = selectedFile.type;

      // PDF Preview
      if (fileType === "application/pdf") {
        filePreview.innerHTML = `<embed src="${URL.createObjectURL(selectedFile)}" type="application/pdf" />`;
      }
    });
     function uploadFile() {
      if (!selectedFile) {
        alert("Please select a file first.");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      fetch("/upload", {
        method: "POST",
        body: formData
      })
        .then(res => res.text())
        .then(msg => alert(msg))
        .catch(err => alert("Upload failed."));
    }