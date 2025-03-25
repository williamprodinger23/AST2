/*

document.querySelector(".search_form").addEventListener("submit", async function(event){
    event.preventDefault();
    const formData = new FormData(this);

    const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: { 'Content-Type' : "application/json"},
        body: JSON.stringify(Object.fromEntries(formData)),
    });

    const data = await response.json();

})

*/
