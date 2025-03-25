document.querySelector(".sell_form").addEventListener("submit", async function(event){
    event.preventDefault();
    const formData = new FormData(this);

    const response = await fetch("http://localhost:8000/submit", {
        method: "POST",
        headers: { 'Content-Type' : "application/json"},
        body: JSON.stringify(Object.fromEntries(formData)),
    });
    if (response.ok) {
        const fileInput = document.getElementById("imageInput");
        if (fileInput?.files[0]) {
            const imageData = new FormData();
            imageData.append("image", fileInput.files[0]);

            await fetch("http://localhost:8000/upload", { method: "POST", body: imageData });
        }
    }
})

const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');

imageInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});