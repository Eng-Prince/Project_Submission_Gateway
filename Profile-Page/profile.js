 // Open popup
    document.getElementById("openPopup").addEventListener("click", () => {
      document.getElementById("popupOverlay").style.display = "flex";
    });

    // Close popup
    document.getElementById("closePopup").addEventListener("click", () => {
      document.getElementById("popupOverlay").style.display = "none";
    });

    // Create profile and show badge
    function createProfile() {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const photo = document.getElementById("photo").value.trim();

      if (name && email && photo) {

        window.location.href = "/views/infoForm.html";

        document.getElementById("profileBadge").style.display = "block";
        document.getElementById("popupOverlay").style.display = "none";
      } else {
        alert("Please fill in all fields!");
      }
    }