
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const messageContainer = document.getElementById("message-container");


document.getElementById("link-to-register").addEventListener("click", () => {
    toggleSections(false);
});

document.getElementById("link-to-login").addEventListener("click", () => {
    toggleSections(true);
});


const toggleSections = (showLogin) => {
    hideMessage();
    if (showLogin) {
        loginSection.style.display = "block";
        registerSection.style.display = "none";
    } else {
        loginSection.style.display = "none";
        registerSection.style.display = "block";
    }
};


const showMessage = (text, isError) => {
    messageContainer.textContent = text;
    messageContainer.style.display = "block";
    if (isError) {
        messageContainer.className = "message-box msg-error";
    } else {
        messageContainer.className = "message-box msg-success";
    }
};

const hideMessage = () => {
    messageContainer.style.display = "none";
};


const validatePassword = (password) => {
    // בדיקת אורך בסיסית
    if (password.length < 4) {
        return false;
    }

    let hasNumber = false;
    
    for (let i = 0; i < password.length; i++) {
        let char = password.charAt(i); 
        let parsed = Number.parseInt(char);
        
        
        if (!isNaN(parsed)) {
            hasNumber = true;
        }
    }

    return hasNumber;
};


document.getElementById("register-form").addEventListener("submit", (event) => {
    event.preventDefault(); 
    hideMessage();

    const usernameInput = document.getElementById("register-username").value.trim();
    const passwordInput = document.getElementById("register-password").value;

    
    let users = JSON.parse(localStorage.getItem("users")) || [];

    
    const userExists = users.find((u) => u.username === usernameInput);
    if (userExists) {
        showMessage("שגיאה: שם המשתמש כבר קיים במערכת!", true);
        return;
    }

    
    if (!validatePassword(passwordInput)) {
        showMessage("שגיאה: הסיסמה חייבת להכיל לפחות 4 תווים ולפחות מספר אחד!", true);
        return;
    }
    const checkpassword=document.querySelector(".check")
    const errormessage=document.querySelector("#error-message")
    if(checkpassword.value!=passwordInput)
    {
       showMessage("הסיסמאות אינם תואמות",true)
       return;
    }

    
    const newUser = {
        username: usernameInput,
        password: passwordInput
    };
    users.push(newUser);

    
    localStorage.setItem("users", JSON.stringify(users));

    showMessage("ההרשמה בוצעה בהצלחה! כעת ניתן להתחבר.", false);
    document.getElementById("register-form").reset();
    
    
    setTimeout(() => {
        toggleSections(true);
    }, 2000);
});


document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    hideMessage();

    const usernameInput = document.getElementById("login-username").value.trim();
    const passwordInput = document.getElementById("login-password").value;
    

    let users = JSON.parse(localStorage.getItem("users")) || [];

    
    const foundUser = users.find((u) => u.username === usernameInput);

    if (foundUser && foundUser.password === passwordInput) {
        
        localStorage.setItem("currentUser", usernameInput);
        showMessage("התחברת בהצלחה! מועבר ללובי המשחקים...", false);
        
        
        setTimeout(() => {
            window.location.href = "../html/lobby.html";
        }, 1500);
    } else {
        showMessage("שגיאה: שם משתמש או סיסמה שגויים!", true);
    }
});


document.getElementById("btn-lobby").addEventListener("click", () => {
    const currentUser = localStorage.getItem("currentUser");

    
    if (currentUser) {
        window.location.href = "../html/lobby.html";
    } else {
        
        showMessage("גישה חסומה! עליך להירשם או להתחבר תחילה כדי להיכנס למשחקים.", true);
        toggleSections(true); 
    }
});