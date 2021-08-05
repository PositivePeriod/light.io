import { Game } from "./game.js";

window.onload = () => {
    var string = [
        'Coloror is a game about light',
        // `Use WASD to control <span class="red">Red light</span>
        // <br>Use IJKL to control <span class="blue">Blue light</span>`,
        `Survive by removing the timers`,
        `Timers are removed by corresponding light
        <br><span class="blue">Blue timer</span> = <span class="blue">Blue light</span>
        <br><span class="yellow">Yellow timer</span> = <span class="red">Red light</span> + <span class="green">Green light</span>`
        // <br><span class="white">White timer</span> = <span class="red">Red light</span> + <span class="blue">Blue light</span> + <span class="green">Green light</span>`,
    ];
    var counter = 0;
    var info = document.getElementById("info");
    info.addEventListener('click', event => {
        info.innerHTML = string[counter++] || "Let's play!";
    });

    var start = document.getElementById("start");

    start.addEventListener('click', event => {
        document.getElementById("content").classList.add("invisible");
        new Game();
    });

}