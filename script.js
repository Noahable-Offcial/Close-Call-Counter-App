/* =====================================
   CLOSE CALL COUNTER
   script.js
   Part 1
===================================== */


/* ==============================
   SUPABASE SETUP
============================== */

const supabaseClient = supabase.createClient(
    window.SUPABASE_CONFIG.url,
    window.SUPABASE_CONFIG.anonKey
);


/* ==============================
   APP DATA
============================== */

let currentUser = null;

let isAdmin = false;

let selectedProfile = null;


let counters = {

    close_call: 0,

    little_blip: 0,

    extra_chance: 0

};



/* ==============================
   PROFILES
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
   LOADING SCREEN
============================== */

window.addEventListener(
    "load",
    () => {

        setTimeout(() => {

            const loader =
                document.getElementById(
                    "loadingScreen"
                );


            if(loader) {

                loader.classList.add(
                    "hidden"
                );

            }


        },2000);

    }
);



/* ==============================
   PROFILE BUTTONS
============================== */

document
.querySelectorAll(".profile-card")
.forEach(card => {


    card.addEventListener(
        "click",
        () => {


            const profile =
                card.dataset.profile;


            if(profile === "Guest") {

                login("Guest");

            }
            else {

                selectedProfile =
                    profile;


                openPin();

            }


        }
    );


});



/* ==============================
   OPEN PIN
============================== */

function openPin() {


    const modal =
        document.getElementById(
            "pinModal"
        );


    if(modal) {

        modal.classList.remove(
            "hidden"
        );

    }


}



/* ==============================
   LOGIN
============================== */

function login(name) {


    currentUser = name;

    isAdmin =
        profiles[name].admin;


    const profileScreen =
        document.getElementById(
            "profileScreen"
        );


    if(profileScreen) {

        profileScreen.classList.add(
            "hidden"
        );

    }



    const welcome =
        document.getElementById(
            "welcomeScreen"
        );


    const welcomeText =
        document.getElementById(
            "welcomeText"
        );


    if(welcome && welcomeText) {


        welcomeText.textContent =
            `Hey ${name}!`;


        welcome.classList.remove(
            "hidden"
        );


    }



    setTimeout(() => {


        if(welcome) {

            welcome.classList.add(
                "hidden"
            );

        }


        const dashboard =
            document.getElementById(
                "dashboard"
            );


        if(dashboard) {

            dashboard.classList.remove(
                "hidden"
            );

        }


        loadCounters();


    },2000);


}


/* ==============================
   PIN CHECK
============================== */

const pinSubmit =
    document.getElementById(
        "pinSubmit"
    );


if(pinSubmit) {

    pinSubmit.addEventListener(
        "click",
        () => {

            const input =
                document.getElementById(
                    "pinInput"
                );


            const selectedUser =
                profiles[selectedProfile];


            if(!selectedUser) {

                showToast(
                    "Profile error",
                    "error"
                );

                return;

            }


            if(
                input.value === selectedUser.pin
            ) {


                const modal =
                    document.getElementById(
                        "pinModal"
                    );


                if(modal) {

                    modal.classList.add(
                        "hidden"
                    );

                }


                login(
                    selectedProfile
                );


            }
            else {


                showToast(
                    "Incorrect PIN",
                    "error"
                );


            }


        }
    );

}
/* =====================================
   CLOSE CALL COUNTER
   Supabase Counters + Realtime
   Part 2
===================================== */


/* ==============================
   LOAD COUNTERS
============================== */

async function loadCounters() {

    try {

        const { data, error } =
            await supabaseClient
            .from("counters")
            .select("*")
            .eq("id", 1)
            .single();


        if(error) {

            console.error(
                "Loading error:",
                error
            );

            showToast(
                "Failed to load counters",
                "error"
            );

            return;

        }


        counters.close_call =
            data.close_call || 0;


        counters.little_blip =
            data.little_blip || 0;


        counters.extra_chance =
            data.extra_chance || 0;


        updateCounters();


        startRealtime();


    }

    catch(error) {

        console.error(error);

    }

}



/* ==============================
   UPDATE COUNTER DISPLAY
============================== */

function updateCounters() {


    const close =
        document.getElementById(
            "closeCallValue"
        );


    const blip =
        document.getElementById(
            "littleBlipValue"
        );


    const extra =
        document.getElementById(
            "extraChanceValue"
        );



    if(close)
        close.textContent =
            counters.close_call;


    if(blip)
        blip.textContent =
            counters.little_blip;


    if(extra)
        extra.textContent =
            counters.extra_chance;



}



/* ==============================
   SAVE COUNTERS
============================== */

async function saveCounters() {


    const { error } =
        await supabaseClient
        .from("counters")
        .update({

            close_call:
                counters.close_call,

            little_blip:
                counters.little_blip,

            extra_chance:
                counters.extra_chance

        })
        .eq(
            "id",
            1
        );


    if(error) {


        console.error(
            "Save error:",
            error
        );


        showToast(
            "Could not save changes",
            "error"
        );


    }


}



/* ==============================
   REALTIME SYNC
============================== */

function startRealtime() {


    supabaseClient
    .channel(
        "counter-sync"
    )
    .on(

        "postgres_changes",

        {

            event:"UPDATE",

            schema:"public",

            table:"counters"

        },


        payload => {


            const data =
                payload.new;


            counters.close_call =
                data.close_call;


            counters.little_blip =
                data.little_blip;


            counters.extra_chance =
                data.extra_chance;



            updateCounters();



        }

    )
    .subscribe();


}



/* ==============================
   CONNECTION STATUS
============================== */

window.addEventListener(
    "online",
    () => {

        showToast(
            "Connection restored",
            "success"
        );

    }
);



window.addEventListener(
    "offline",
    () => {

        showToast(
            "You are offline",
            "warning"
        );

    }
);
/* =====================================
   CLOSE CALL COUNTER
   Admin Controls + Toasts + Notifications
   Part 3
===================================== */


/* ==============================
   ADMIN BUTTON CONTROLS
============================== */

document
.querySelectorAll(".control-btn")
.forEach(button => {


    button.addEventListener(
        "click",
        async () => {


            if(!isAdmin) {

                showToast(
                    "Admin access required",
                    "error"
                );

                return;

            }



            const counter =
                button.dataset.counter;



            if(button.dataset.action === "increase") {

                counters[counter]++;

            }



            if(button.dataset.action === "decrease") {

                if(counters[counter] > 0) {

                    counters[counter]--;

                }

            }



            updateCounters();


            await saveCounters();


            sendChangeNotification(
                counter
            );


        }
    );


});



/* ==============================
   RESET BUTTONS
============================== */

document
.querySelectorAll(".reset-btn")
.forEach(button => {


    button.addEventListener(
        "click",
        async () => {


            if(!isAdmin)
                return;



            const counter =
                button.dataset.counter;



            const confirmReset =
                confirm(
                    "Reset this counter?"
                );



            if(!confirmReset)
                return;



            counters[counter] = 0;



            updateCounters();


            await saveCounters();



            showToast(
                "Counter reset",
                "success"
            );


        }
    );


});



/* ==============================
   EDITABLE INPUTS
============================== */

document
.querySelectorAll(".admin-input")
.forEach(input => {


    input.addEventListener(
        "change",
        async () => {


            if(!isAdmin)
                return;



            const counter =
                input.dataset.counter;



            counters[counter] =
                Number(
                    input.value
                );



            if(counters[counter] < 0) {

                counters[counter] = 0;

            }



            updateCounters();


            await saveCounters();


        }
    );


});



/* ==============================
   NOTIFICATIONS
============================== */

async function enableNotifications() {


    if(
        "Notification" in window
    ) {


        await Notification.requestPermission();


    }


}



function sendChangeNotification(counter) {


    let message =
        "Counter changed.";



    if(counter === "close_call")
        message =
        "⚠️ Close Call Counter changed.";


    if(counter === "little_blip")
        message =
        "⚠️ Little Blip Counter changed.";


    if(counter === "extra_chance")
        message =
        "⚠️ Extra Chances changed.";



    if(
        Notification.permission ===
        "granted"
    ) {


        new Notification(
            "Close Call Counter",
            {

                body: message

            }
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



    toast.textContent =
        message;



    container.appendChild(
        toast
    );



    setTimeout(
        () => {


            toast.remove();


        },
        4000
    );


}



/* ==============================
   ELLIOTT NOTIFICATIONS
============================== */

if(currentUser === "Elliott") {

    enableNotifications();

}
/* =====================================
   CLOSE CALL COUNTER
   Admin Panel + Final Features
   Part 4
===================================== */


/* ==============================
   ADMIN PANEL
============================== */

const adminButton =
    document.getElementById(
        "adminPanelButton"
    );


const adminModal =
    document.getElementById(
        "adminModal"
    );


const closeAdmin =
    document.getElementById(
        "closeAdminModal"
    );



if(adminButton) {


    adminButton.addEventListener(
        "click",
        () => {


            if(!isAdmin) {


                showToast(
                    "Admin only",
                    "error"
                );


                return;


            }


            adminModal.classList.remove(
                "hidden"
            );


        }
    );


}



if(closeAdmin) {


    closeAdmin.addEventListener(
        "click",
        () => {


            adminModal.classList.add(
                "hidden"
            );


        }
    );


}



/* ==============================
   COPY PIN BUTTONS
============================== */

document
.querySelectorAll(".copy-btn")
.forEach(button => {


    button.addEventListener(
        "click",
        async () => {


            const value =
                button.dataset.copy;



            try {


                await navigator.clipboard.writeText(
                    value
                );


                showToast(
                    "Copied!",
                    "success"
                );


            }


            catch(error) {


                showToast(
                    "Copy failed",
                    "error"
                );


            }


        }
    );


});



/* ==============================
   PROFILE DISPLAY
============================== */

function updateUserDisplay() {


    const user =
        document.getElementById(
            "loggedInUser"
        );


    if(user) {

        user.textContent =
            currentUser;

    }


    if(isAdmin) {


        const controls =
            document.querySelectorAll(
                ".admin-controls"
            );


        controls.forEach(control => {

            control.classList.remove(
                "hidden"
            );

        });


    }


}



/* ==============================
   KEYBOARD SHORTCUTS
============================== */


document.addEventListener(
    "keydown",
    event => {


        // ESC closes modals

        if(event.key === "Escape") {


            document
            .querySelectorAll(
                ".modal"
            )
            .forEach(modal => {


                modal.classList.add(
                    "hidden"
                );


            });


        }


        // CTRL + SHIFT + A opens admin

        if(
            event.ctrlKey &&
            event.shiftKey &&
            event.key === "A"
        ) {


            if(isAdmin && adminModal) {


                adminModal.classList.remove(
                    "hidden"
                );


            }


        }


    }
);



/* ==============================
   SAFETY CHECKS
============================== */

window.addEventListener(
    "error",
    event => {


        console.error(
            "App error:",
            event.error
        );


    }
);



/* ==============================
   START FINISH SETUP
============================== */

setTimeout(
    () => {

        updateUserDisplay();

    },
    1000
);



console.log(
    "Close Call Counter ready 🚀"
);
