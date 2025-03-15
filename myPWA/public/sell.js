document.querySelector(".sell_form").addEventListener("submit", async function(event){
    event.preventDefault();
    const formData = new FormData(this);

    //const user_input = formData.get("image");
    const user_input = document.getElementById("imageInput");
    console.log(user_input);
    if (user_input) {
        const file = user_input.files[0];
        if (!file) {
            alert("Please Insert An Image");
            return;
        }

        const imageData = new FormData();
        imageData.append('image', file);
        fetch("http://localhost:8000/upload", {
            method: 'POST',
            body: imageData,
        })
        .then(response => response.json())
    }
    /*
    if (file){
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            fetch()
            document.getElementById('preview').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
    */

    const response = await fetch("http://localhost:8000/submit", {
        method: "POST",
        headers: { 'Content-Type' :"application/json"},
        body: JSON.stringify({
            year: formData.get("year"),
            brand: formData.get("brand"),
            model: formData.get("model"),
            body_type: formData.get("body_type"),
            engine_type: formData.get("engine_type"),
            engine_size: formData.get("engine_size"),
            transmission: formData.get("transmission")
        })
    });
    const result = await response.json();
})