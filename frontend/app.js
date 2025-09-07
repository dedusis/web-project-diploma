import {login,getProfile} from "./api.js";

const form = document.querySelector("form");
const username = document.getElementById("username");
const password = document.getElementById("password");

form.addEventListener("submit",async(e) => {
    e.preventDefault();
    try{
        const { token, accessToken, jwt } = await login(username.value.trim(), password.value);
    const authToken = token || accessToken || jwt;
    if (!authToken) return alert("Δεν επιστράφηκε token.");

    localStorage.setItem("token", authToken);
    const me = await getProfile(authToken);
    // Redirect ανά ρόλο
    if (me.role === "student") location.href = "student/student.html";
    else if (me.role === "professor") location.href ="professor/professor1.html";
    else if (me.role === "secretary") location.href = "secretary/secretary.html";
    else alert("Σύνδεση χωρίς γνωστό ρόλο: " + (me.role ?? "—"));
    } catch (err) {
    alert("Σφάλμα login: " + (err?.error || err?.message || JSON.stringify(err)));

    }
});