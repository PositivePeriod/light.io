import { Game } from "./game.js";

window.onload = () => { new Game() };

//     var string = [
//         'Coloror is a game about light',
//         // `Use WASD to control <span class="red">Red light</span>
//         // <br>Use IJKL to control <span class="blue">Blue light</span>`,
//         `Survive by removing the timers`,
//         `Timers are removed by corresponding light
//         <br><span class="blue">Blue timer</span> = <span class="blue">Blue light</span>
//         <br><span class="yellow">Yellow timer</span> = <span class="red">Red light</span> + <span class="green">Green light</span>`
//         // <br><span class="white">White timer</span> = <span class="red">Red light</span> + <span class="blue">Blue light</span> + <span class="green">Green light</span>`,
//     ];
//     var counter = 0;
//     var info = document.getElementById("info");
//     info.addEventListener('click', event => {
//         info.innerHTML = string[counter++] || "Let's play!";
//     });

//     var start = document.getElementById("start");

//     start.addEventListener('click', event => {
//         document.getElementById("content").classList.add("invisible");
//         new Game();
//     });

// }


// var canvas = document.getElementById("unity-canvas");
// var container = canvas.parentElement;
// var height = 200;
// var width = 100;

// function onResize() {
//     var w;
//     var h;

//     w = window.innerWidth;
//     h = window.innerHeight;

//     var r = width / height;

//     if (w * r > window.innerHeight) {
//         w = Math.min(w, Math.ceil(h / r));
//     }
//     h = Math.floor(w * r);

//     container.style.width = canvas.style.width = w + "px";
//     container.style.height = canvas.style.height = h + "px";
//     container.style.top = Math.floor((window.innerHeight - h) / 2) + "px";
//     container.style.left = Math.floor((window.innerWidth - w) / 2) + "px";
// }

// window.addEventListener('resize', onResize);
// onResize();