// how much wiggle-room is allowed when
// matching the color?
let tolerance = 6;

// color to look for (set with mouse click)
let colorToMatch;

let video;

let tracker;

let scales = {
  'C Major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
  'G Major': ['G4', 'A4', 'B4', 'C5', 'D5', 'E5'], // Starting from G note
  'D Minor': ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4'], // Includes F# instead of F
  'A Minor': ['A4', 'B4', 'C5', 'D5', 'E5', 'F5'], // A minor scale
  'E Minor': ['E4', 'F#4', 'G4', 'A4', 'B4', 'C5'], // E minor scale
  'F Major': ['F4', 'G4', 'A4', 'Bb4', 'C5', 'D5'], // Includes Bb instead of B
};

let scale = scales['C Major'];

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

const reverb = new Tone.JCReverb(0.4).toDestination();
const synth = new Tone.PolySynth(Tone.AMSynth).chain(reverb);

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

function addDom() {
  const dom = document.createElement('div');

  dom.id = 'dom';

  const info = document.createElement('p');
  info.innerHTML = 'Use your camera to make music with colors.';

  dom.appendChild(info);

  const dropdown = document.createElement('select');

  for (const scaleName in scales) {
    const option = document.createElement('option');
    option.value = scaleName;
    option.text = scaleName;
    dropdown.appendChild(option);
  }

  dropdown.addEventListener('change', function () {
    scale = scales[this.value];
  });

  dom.appendChild(dropdown);

  document.body.appendChild(dom);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  noStroke();

  addDom();

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

  image(video, 0, 0);
  console.log('ok');

  if (keyIsDown(LEFT_ARROW)) {
    console.log('left');
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
