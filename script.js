/* =====================================
   CLOSE CALL COUNTER
   Main JavaScript
   Part 1
===================================== */


/* ==============================
   SUPABASE CONNECTION
============================== */

const supabaseClient = window.supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
);


/* ==============================
   APP STATE
============================== */

let currentUser = null;

let currentProfile = null;

let counters = {

    closeCall: 0,

    littleBlip: 0,

    extraChance: 0

};


let selectedCounter = null;


/* ==============================
   PROFILE DATA
============================== */

const profiles = {

    Noah: {

        pin: "0895",

        admin: true

    },


    Elliott: {

        pin: "1423",

        admin: false

    },


    Guest: {

        pin: null,

        admin: false

    }

};


/* ==============================
   DOM ELEMENTS
============================== */

const loadingScreen =
    document.getElementById("loadingScreen");


const profileScreen =
    document.getElementById("profileScreen");


const pinModal =
    document.getElementById("pinModal");


const pinInput =
    document.getElementById("pinInput");


const pinSubmit =
    document.getElementById("pinSubmit");


const closePinModal =
    document.getElementById("closePinModal");


const pinError =
    document.getElementById("pinError");


const welcomeScreen =
    document.getElementById("welcomeScreen");


const welcomeText =
    document.getElementById("welcomeText");


const dashboard =
    document.getElementById("dashboard");


const loggedInUser =
    document.getElementById("loggedInUser");


const adminPanelButton =
    document.getElementById("adminPanelButton");



/* ==============================
   START APP
============================== */


window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            loadingScreen.style.opacity = "0";

            setTimeout(() => {

                loadingScreen.classList.add(
                    "hidden"
                );

            },500);


        },2000);


    }
);


/* ==============================
   PROFILE SELECTION
============================== */


document
.querySelectorAll(".profile-card")
.forEach(card => {


    card.addEventListener(
        "click",
        () => {


            const profile =
                card.dataset.profile;


            if(profile === "guest") {

                loginUser("Guest");

            }


            if(profile === "noah") {

                openPin("Noah");

            }


            if(profile === "elliott") {

                openPin("Elliott");

            }


        }
    );


});



/* ==============================
   OPEN PIN WINDOW
============================== */


function openPin(profile) {


    currentProfile = profile;


    document.getElementById(
        "pinTitle"
    ).textContent =
        `${profile} PIN`;


    pinInput.value = "";

    pinError.style.display =
        "none";


    pinModal.classList.remove(
        "hidden"
    );


    pinInput.focus();


}



/* ==============================
   CLOSE PIN
============================== */


closePinModal.addEventListener(
    "click",
    () => {

        pinModal.classList.add(
            "hidden"
        );

    }
);



/* ==============================
   CHECK PIN
============================== */


pinSubmit.addEventListener(
    "click",
    () => {


        const entered =
            pinInput.value;


        if(
            entered === profiles[currentProfile].pin
        ) {


            pinModal.classList.add(
                "hidden"
            );


            loginUser(
                currentProfile
            );


        } else {


            pinError.style.display =
                "block";


            pinInput.classList.add(
                "shake"
            );


            setTimeout(() => {

                pinInput.classList.remove(
                    "shake"
                );

            },500);


        }


    }
);



/* ==============================
   LOGIN USER
============================== */


function loginUser(name) {


    currentUser = name;


    const userData =
        profiles[name];


    profileScreen.classList.add(
        "hidden"
    );


    welcomeScreen.classList.remove(
        "hidden"
    );


    welcomeText.textContent =
        `Hey ${name}!`;



    setTimeout(() => {


        welcomeScreen.classList.add(
            "hidden"
        );


        dashboard.classList.remove(
            "hidden"
        );


        loggedInUser.textContent =
            name;



        if(userData.admin) {

            adminPanelButton.classList.remove(
                "hidden"
            );

            document
            .querySelectorAll(".admin-controls")
            .forEach(control => {

                control.classList.remove(
                    "hidden"
                );

            });

        }


    },2000);


}
/* =====================================
   SUPABASE DATABASE + COUNTERS
   Part 2
===================================== */


/* ==============================
   DATABASE SETTINGS
============================== */

const COUNTER_TABLE = "counters";



/* ==============================
   LOAD COUNTERS
============================== */

async function loadCounters() {

    try {

        const { data, error } =
            await supabaseClient
                .from(COUNTER_TABLE)
                .select("*")
                .single();


        if(error) {

            console.error(
                "Database error:",
                error
            );

            showToast(
                "Unable to load counters",
                "error"
            );

            return;

        }


        counters.closeCall =
            data.close_call || 0;


        counters.littleBlip =
            data.little_blip || 0;


        counters.extraChance =
            data.extra_chance || 0;


        updateDisplay();


    } catch(error) {


        console.error(error);


    }

}



/* ==============================
   UPDATE DISPLAY
============================== */


function updateDisplay() {


    animateNumber(
        "closeCallValue",
        counters.closeCall
    );


    animateNumber(
        "littleBlipValue",
        counters.littleBlip
    );


    animateNumber(
        "extraChanceValue",
        counters.extraChance
    );


    document.getElementById(
        "closeCallInput"
    ).value =
        counters.closeCall;


    document.getElementById(
        "littleBlipInput"
    ).value =
        counters.littleBlip;


    document.getElementById(
        "extraChanceInput"
    ).value =
        counters.extraChance;


}



/* ==============================
   NUMBER ANIMATION
============================== */


function animateNumber(id, value) {


    const element =
        document.getElementById(id);


    if(!element) return;


    const start =
        Number(
            element.textContent
        );


    const difference =
        value - start;


    const duration =
        500;


    let startTime = null;


    function animate(time) {


        if(!startTime)
            startTime = time;


        const progress =
            Math.min(
                (time - startTime) / duration,
                1
            );


        element.textContent =
            Math.floor(
                start +
                difference *
                progress
            );


        if(progress < 1) {

            requestAnimationFrame(
                animate
            );

        }


    }


    requestAnimationFrame(
        animate
    );


}



/* ==============================
   SAVE COUNTERS
============================== */


async function saveCounters() {


    const { error } =
        await supabaseClient
        .from(COUNTER_TABLE)
        .update({

            close_call:
                counters.closeCall,

            little_blip:
                counters.littleBlip,

            extra_chance:
                counters.extraChance

        })
        .eq(
            "id",
            1
        );


    if(error) {


        console.error(error);


        showToast(
            "Save failed",
            "error"
        );


        return false;


    }


    return true;


}



/* ==============================
   ADMIN CONTROLS
============================== */


document
.querySelectorAll(".control-btn")
.forEach(button => {


    button.addEventListener(
        "click",
        async () => {


            if(
                currentUser !== "Noah"
           /* =====================================
   ADMIN ACTIONS + REALTIME
   Part 3
===================================== */


/* ==============================
   CONTINUE ADMIN CONTROLS
============================== */

document
.querySelectorAll(".control-btn")
.forEach(button => {


    button.addEventListener(
        "click",
        async () => {


            if(currentUser !== "Noah") {

                return;

            }


            const counter =
                button.dataset.counter;


            if(button.classList.contains("increase")) {


                counters[counter]++;


            }


            if(button.classList.contains("decrease")) {


                if(counters[counter] > 0) {

                    counters[counter]--;

                }


            }


            updateDisplay();


            await saveCounters();


            showToast(
                `${counter} updated`,
                "success"
            );


        }
    );


});



/* ==============================
   MANUAL NUMBER EDIT
============================== */


document
.querySelectorAll(".admin-controls input")
.forEach(input => {


    input.addEventListener(
        "change",
        async () => {


            if(currentUser !== "Noah")
                return;


            const id =
                input.id;


            let counter;


            if(id === "closeCallInput")
                counter = "closeCall";


            if(id === "littleBlipInput")
                counter = "littleBlip";


            if(id === "extraChanceInput")
                counter = "extraChance";



            counters[counter] =
                Number(input.value);



            if(counters[counter] < 0) {

                counters[counter] = 0;

            }


            updateDisplay();

            await saveCounters();


            showToast(
                "Counter changed",
                "success"
            );


        }
    );


});



/* ==============================
   LOAD DATA AFTER LOGIN
============================== */


const originalLogin =
    loginUser;


loginUser = function(name) {


    originalLogin(name);


    setTimeout(() => {

        loadCounters();

        startRealtime();

    },2100);


};




/* ==============================
   SUPABASE REALTIME
============================== */


function startRealtime() {


    supabaseClient
    .channel(
        "counter-updates"
    )
    .on(
        "postgres_changes",
        {

            event:"UPDATE",

            schema:"public",

            table:COUNTER_TABLE

        },

        payload => {


            const data =
                payload.new;


            counters.closeCall =
                data.close_call;


            counters.littleBlip =
                data.little_blip;


            counters.extraChance =
                data.extra_chance;



            updateDisplay();



        }
    )
    .subscribe(
        status => {


            const indicator =
                document.getElementById(
                    "connectionStatus"
                );


            if(status === "SUBSCRIBED") {


                indicator.className =
                    "status connected";


                indicator.innerHTML =
                    `
                    <span class="dot"></span>
                    Connected
                    `;


            }


            if(status === "CHANNEL_ERROR") {


                indicator.className =
                    "status offline";


                indicator.innerHTML =
                    `
                    <span class="dot"></span>
                    Offline
                    `;


            }


        }
    );


}



/* ==============================
   SUPABASE RECONNECT CHECK
============================== */


window.addEventListener(
    "online",
    () => {


        showToast(
            "Connection restored",
            "success"
        );


        startRealtime();


    }
);



window.addEventListener(
    "offline",
    () => {


        const indicator =
            document.getElementById(
                "connectionStatus"
            );


        indicator.className =
            "status offline";


        indicator.innerHTML =
            `
            <span class="dot"></span>
            Offline
            `;


        showToast(
            "Internet connection lost",
            "warning"
        );


    }
);
          /* =====================================
   NOTIFICATIONS + TOASTS + ADMIN PANEL
   Part 4 FINAL
===================================== */


/* ==============================
   BROWSER NOTIFICATIONS
============================== */


async function requestNotifications() {


    if(
        "Notification" in window
    ) {


        const permission =
            await Notification.requestPermission();


        if(permission === "granted") {


            showToast(
                "Notifications enabled",
                "success"
            );


        }


    }


}



if(currentUser === "Elliott") {

    requestNotifications();

}



/* ==============================
   SEND NOTIFICATION
============================== */


function sendNotification(title, message) {


    if(
        Notification.permission === "granted"
    ) {


        const notification =
            new Notification(
                title,
                {

                    body: message,

                    icon:"assets/logo.svg"

                }
            );


        notification.onclick =
            () => {


                window.focus();


                notification.close();


            };


    }

    else {


        showToast(
            message,
            "warning"
        );


    }


}



/* ==============================
   TOAST SYSTEM
============================== */


function showToast(
    message,
    type="info"
) {


    const container =
        document.getElementById(
            "toastContainer"
        );


    if(!container)
        return;



    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    let icon =
        "ℹ️";


    if(type==="success")
        icon="✅";


    if(type==="error")
        icon="❌";


    if(type==="warning")
        icon="⚠️";



    toast.innerHTML =
        `

        <div class="toast-icon">
            ${icon}
        </div>

        <div>
            ${message}
        </div>

        `;



    container.appendChild(
        toast
    );



    setTimeout(
        () => {


            toast.style.opacity =
                "0";


            setTimeout(
                () => toast.remove(),
                300
            );


        },
        4000
    );


}



/* ==============================
   ADMIN PANEL
============================== */


const adminModal =
    document.getElementById(
        "adminModal"
    );


adminPanelButton.addEventListener(
    "click",
    () => {


        if(currentUser !== "Noah")
            return;


        adminModal.classList.remove(
            "hidden"
        );


    }
);



document
.getElementById(
    "closeAdminModal"
)
.addEventListener(
    "click",
    () => {


        adminModal.classList.add(
            "hidden"
        );


    }
);



/* ==============================
   COPY PIN BUTTONS
============================== */


document
.querySelectorAll(".copy-btn")
.forEach(button => {


    button.addEventListener(
        "click",
        async () => {


            await navigator.clipboard.writeText(
                button.dataset.copy
            );


            showToast(
                "PIN copied",
                "success"
            );


        }
    );


});



/* ==============================
   RESET COUNTERS
============================== */


document
.querySelectorAll(".reset-btn")
.forEach(button => {


    button.addEventListener(
        "click",
        () => {


            if(currentUser !== "Noah")
                return;


            selectedCounter =
                button.dataset.counter;



            const modal =
                document.getElementById(
                    "confirmModal"
                );


            modal.classList.remove(
                "hidden"
            );


        }
    );


});



document
.getElementById(
    "cancelReset"
)
.addEventListener(
    "click",
    () => {


        document
        .getElementById(
            "confirmModal"
        )
        .classList.add(
            "hidden"
        );


    }
);



document
.getElementById(
    "confirmReset"
)
.addEventListener(
    "click",
    async () => {


        counters[selectedCounter] = 0;


        updateDisplay();


        await saveCounters();



        document
        .getElementById(
            "confirmModal"
        )
        .classList.add(
            "hidden"
        );


        showToast(
            "Counter reset",
            "success"
        );


    }
);



/* ==============================
   ESC KEY SUPPORT
============================== */


document.addEventListener(
    "keydown",
    event => {


        if(event.key === "Escape") {


            document
            .querySelectorAll(".modal")
            .forEach(modal => {


                modal.classList.add(
                    "hidden"
                );


            });


        }


    }
);



/* ==============================
   FINISHED
============================== */


console.log(
    "Close Call Counter loaded successfully"
);
