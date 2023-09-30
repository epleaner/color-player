// how much wiggle-room is allowed when
// matching the color?
let tolerance = 6;

// color to look for (set with mouse click)
let colorToMatch;

let video;

let tracker;

let scales = {
  cMajor: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
  gMajor: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5'], // Starting from G note
  dMajor: ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4'], // Includes F# instead of F
  aMinor: ['A4', 'B4', 'C5', 'D5', 'E5', 'F5'], // A minor scale
  eMinor: ['E4', 'F#4', 'G4', 'A4', 'B4', 'C5'], // E minor scale
  fMajor: ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'], // Includes Bb instead of B
};

let scale = scales['cMajor'];

let shouldPlayRed = false;
let isPlayingRed = false;
let colors = [
  {
    name: 'red',
    shouldPlay: false,
    isPlaying: false,
    note: 'C4',
    threshold: function (r, g, b) {
      return r > 150 && g < 50 && b < 50;
    },
  },
  {
    name: 'yellow',
    shouldPlay: false,
    isPlaying: false,
    note: 'E4',
    threshold: function (r, g, b) {
      return r > 200 && g > 200 && b < 100;
    },
  },
  {
    name: 'orange',
    shouldPlay: false,
    isPlaying: false,
    note: 'D4',
    threshold: function (r, g, b) {
      return r > 200 && g > 50 && g < 120 && b < 50;
    },
  },
  {
    name: 'green',
    shouldPlay: false,
    isPlaying: false,
    note: 'C2',
    threshold: function (r, g, b) {
      return r < 90 && g > 110 && b < 90;
    },
  },
  {
    name: 'blue',
    shouldPlay: false,
    isPlaying: false,
    note: 'C3',
    threshold: function (r, g, b) {
      return r < 90 && g < 90 && b > 130;
    },
  },
  {
    name: 'purple',
    shouldPlay: false,
    isPlaying: false,
    note: 'F4',
    threshold: function (r, g, b) {
      return r > 130 && g < 80 && b > 130;
    },
  },
];

const synth = new Tone.PolySynth(Tone.MonoSynth).toDestination();

synth.set({
  oscillator: {
    type: 'sine',
  },
  volume: 5,
});

function getNote(c) {
  return scale[colors.indexOf(c)];
}

function getColorName(rgb) {
  return `rgba(${rgb.join(',')})`;
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  noStroke();

  const dropdown = document.createElement('select');
  dropdown.style.position = 'fixed';
  dropdown.style.right = 0;
  dropdown.style.top = 0;

  for (const scaleName in scales) {
    const option = document.createElement('option');
    option.value = scaleName;
    option.text = scaleName;
    dropdown.appendChild(option);
  }

  dropdown.addEventListener('change', function () {
    scale = scales[this.value];
  });

  document.body.appendChild(dropdown);

  video = createCapture(VIDEO);
  video.id('video');
  video.size(640, 480);

  colors.forEach((c) => {
    tracking.ColorTracker.registerColor(c.name, c.threshold);
  });

  tracker = new tracking.ColorTracker(colors.map((c) => c.name));

  tracking.track('#video', tracker, { camera: true });

  tracker.on('track', function (event) {
    colors.forEach((c) => {
      let colorEvent = event.data.filter((d) => d.color === c.name);
      c.shouldPlay = colorEvent.length > 0;

      const note = getNote(c);

      if (c.shouldPlay && !c.isPlaying) {
        synth.triggerAttack(note);
        c.isPlaying = true;
      } else if (!c.shouldPlay && c.isPlaying) {
        synth.triggerRelease(note);
        c.isPlaying = false;
      }
    });

    video.hide();
  });
}

function draw() {
  background(255, 255, 255, 200);
  // image(video, 0, 0);

  if (keyIsDown(32)) {
    if (keyIsDown(LEFT_ARROW)) {
      const note = getNote(colors[0]);
      if (!colors[0].isPlaying) {
        synth.triggerAttack(note);
        colors[0].isPlaying = true;
      } else {
        synth.triggerRelease(note);
        colors[0].isPlaying = false;
      }
    }
    if (keyIsDown(RIGHT_ARROW)) {
      const note = getNote(colors[1]);
      if (!colors[1].isPlaying) {
        synth.triggerAttack(note);
        colors[1].isPlaying = true;
      } else {
        synth.triggerRelease(note);
        colors[1].isPlaying = false;
      }
    }
    if (keyIsDown(UP_ARROW)) {
      const note = getNote(colors[2]);
      if (!colors[2].isPlaying) {
        synth.triggerAttack(note);
        colors[2].isPlaying = true;
      } else {
        synth.triggerRelease(note);
        colors[2].isPlaying = false;
      }
    }
  }

  colors.forEach((c) => {
    if (c.isPlaying) {
      fill(c.name);
      Array.from({ length: Math.floor(Math.random() * 5) + 1 }).forEach(() => {
        circle(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 300 + 10
        );
      });
    }
  });
}

// use the mouse to select a color to track
function mousePressed() {
  colorToMatch = get(mouseX, mouseY);

  const colorName = getColorName(colorToMatch);

  console.log(colorName);

  // tracking.ColorTracker.registerColor(colorName, function (r, g, b) {
  //   return (
  //     Math.abs(r - colorToMatch[0]) < tolerance &&
  //     Math.abs(g - colorToMatch[1]) < tolerance &&
  //     Math.abs(b - colorToMatch[2]) < tolerance
  //   );
  // });

  // tracker.setColors([...tracker.getColors(), colorName]);
  // console.log(tracker.getColors());
}
