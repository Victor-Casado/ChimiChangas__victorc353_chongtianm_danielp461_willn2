// Map keyboard key codes to controller's state keys
const keyMap = {
    KeyW: 'up',
    ArrowUp: 'up',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyD: 'right',
    ArrowRight: 'right',
    KeyE: 'pickUpItem',
    KeyC: 'openChest',
    KeyF: "switchItem"
};

// Class for handling keyboard inputs.
export class Controller
{
    constructor(active)
    {
        // The controller's state.
        this.keys = {
            up: { pressed: false, doubleTap: false, timestamp: 0 },
            left: { pressed: false, doubleTap: false, timestamp: 0 },
            down: { pressed: false, doubleTap: false, timestamp: 0 },
            right: { pressed: false, doubleTap: false, timestamp: 0 },
            pickUpItem: {pressed: false, doubleTap: false, timestamp: 0},
            openChest: {pressed: false, doubleTap: false, timestamp: 0},
            switchItem: {pressed: false, doubleTap: false, timestamp: 0}
        };

        this.sprint = false;

        if(active){
            window.addEventListener('keydown', (event) => this.keydownHandler(event));
            window.addEventListener('keyup', (event) => this.keyupHandler(event));
            window.addEventListener('mousemove', (event) => this.mouseHandler(event));
            window.addEventListener('mousedown', (event) => this.clickHandler(event));
            window.addEventListener('mouseup', (event) => { if (event.button === 0) this.clicked = false; });
        }

        this.mouseX = null;
        this.mouseY = null;
        this.clicked = false;
    }
    clickHandler(event){
        if (event.which === 1) {
            this.clicked = true;
        }
    }
    mouseHandler(event){
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
      // console.log(`Mouse position: X = ${mouseX}, Y = ${mouseY}`);
    }
    keydownHandler(event)
    {
        const key = keyMap[event.code];

        if (!key) return;

        const now = Date.now();

        // If not already in the double-tap state, toggle the double tap state if the key was pressed twice within 300ms.
        this.keys[key].doubleTap = this.keys[key].doubleTap || now - this.keys[key].timestamp < 300;

        // Sprint
        this.sprint = this.keys[key].doubleTap;

        // Toggle on the key pressed state.
        this.keys[key].pressed = true;
    }

    keyupHandler(event)
    {
        const key = keyMap[event.code];

        if (!key) return;

        const now = Date.now();

        // Reset the key pressed state.
        this.keys[key].pressed = false;

        // Reset double tap only if the key is in the double-tap state.
        if (this.keys[key].doubleTap) this.keys[key].doubleTap = false;
        // Otherwise, update the timestamp to track the time difference till the next potential key down.
        else this.keys[key].timestamp = now;
    }
}
