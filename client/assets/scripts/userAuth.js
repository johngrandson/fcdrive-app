// make the request to the login endpoint
function login() {
    const loginUrl = "http://localhost:5000/auth/login"
    const xhr = new XMLHttpRequest();
    const userElement = document.getElementById('username');
    const passwordElement = document.getElementById('password');
    let tokenElement;
    const email = userElement.value;
    const password = passwordElement.value;

    xhr.open('POST', loginUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.addEventListener('load', function () {
        const responseObject = JSON.parse(this.response);
        if (responseObject.token) {
            tokenElement = responseObject.token;
            window.location.href = "settings.html";
            window.localStorage.setItem('token', tokenElement);
        } else {
            window.location.href = "unauthorized.html";
        }
    });
    const sendObject = JSON.stringify({ email, password });
    xhr.send(sendObject);
    localStorage.setItem('token', window.btoa(email + password));
}