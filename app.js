import { SONGS_CONFIG } from "./assets/config.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Elements
const cd = $(".cd");
const audio = $("audio");
const playBtn = $(".play");
const progress = $(".progress");
const currentTimeFormat = $(".times .current");
const durationTimeFormat = $(".times .duration");
const playList = $(".songs");
const nextBtn = $(".next");
const prevBtn = $(".prev");
const randomBtn = $(".random");
const repeatBtn = $(".repeat");
const playIcon = $(".icon-play");
const pauseIcon = $(".icon-pause");

// Variables
var currentSongIndex = 0;
var isPlaying = false;
var settings = {
  isRandom: false,
  isRepeat: false,
};
var selectedRandomSongs = [];

/**
 * @description Handle to next or back song
 * @param {Boolean} isNextSong
 */
const transferSong = (isNextSong) => {
  if (settings.isRandom) {
    let newSongIndex = currentSongIndex;
    do {
      newSongIndex = Math.floor(Math.random() * SONGS_CONFIG.length);
    } while (
      newSongIndex == currentSongIndex ||
      selectedRandomSongs.includes(newSongIndex)
    );

    // Update selected random songs
    selectedRandomSongs.push(newSongIndex);
    // Reset selected random songs when number of songs is full
    if (selectedRandomSongs.length == SONGS_CONFIG.length) {
      selectedRandomSongs = [];
    }

    // Update current song index
    currentSongIndex = newSongIndex;
  } else {
    if (isNextSong) {
      currentSongIndex++;
      if (currentSongIndex >= SONGS_CONFIG.length) {
        currentSongIndex = 0;
      }
    } else {
      currentSongIndex--;
      if (currentSongIndex < 0) {
        currentSongIndex = SONGS_CONFIG.length - 1;
      }
    }
  }

  loadCurrentSong();
  audio.play();
};

/**
 *  Listen and handle events
 */
const handleEvents = () => {
  // Handle when scrolling document
  const offsetWidth = cd.offsetWidth;
  document.onscroll = () => {
    // Get distance from current positions
    const distance = window.scrollY ?? document.documentElement.scrollTop;
    // Calculate remaining width of cd element
    const remainingCDWidth = offsetWidth - distance;
    // set style width and opacity to cd element
    cd.style.width = remainingCDWidth > 0 ? remainingCDWidth + "px" : 0;
    cd.style.height = cd.style.width;
    cd.style.opacity = remainingCDWidth / offsetWidth;
  };

  // Handle when change progress bar
  progress.oninput = (e) => {
    console.log("input", e.target.value);
    audio.currentTime = (e.target.value / 100) * audio.duration;
  };

  // Handle when click on the play button
  playBtn.onclick = (e) => {
    if (!isPlaying) {
      pauseIcon.style.display = "block";
      playIcon.style.display = "none";
      audio.play();
      // Cập nhật tiêu đề
      e.target.closest(".play").title = "Tạm dừng";
    } else {
      playIcon.style.display = "block";
      pauseIcon.style.display = "none";
      audio.pause();
      // Cập nhật tiêu đề
      e.target.closest(".play").title = "Phát nhạc";
    }
    isPlaying = !isPlaying;
  };

  // Handle when click on the next button
  nextBtn.onclick = () => {
    transferSong(true);
  };

  // Handle when click on the pre button
  prevBtn.onclick = () => {
    transferSong(false);
  };

  // Handle when click on the random button
  randomBtn.onclick = () => {
    settings.isRandom = !settings.isRandom;
    if (settings.isRandom) {
      randomBtn.classList.add("active");
    } else {
      randomBtn.classList.remove("active");
    }
  };

  // Handle when click on the repeat button
  repeatBtn.onclick = () => {
    settings.isRepeat = !settings.isRepeat;
    if (settings.isRepeat) {
      repeatBtn.classList.add("active");
    } else {
      repeatBtn.classList.remove("active");
    }
  };

  //#region audio
  // Handle when start to load audio
  audio.onloadedmetadata = () => {
    currentTimeFormat.textContent = `${formatTime(
      Math.floor(audio.currentTime)
    )}`;
    durationTimeFormat.textContent = `${formatTime(
      Math.floor(audio.duration)
    )}`;
  };

  // Handle when playing the audio
  audio.ontimeupdate = () => {
    // Update current time
    currentTimeFormat.textContent = `${formatTime(
      Math.floor(audio.currentTime)
    )}`;
    // Update progress
    if (audio.duration) {
      progress.value = Math.floor((audio.currentTime / audio.duration) * 100);
    } else {
      progress.value = 0;
    }
  };

  // Handle when finish playing a song
  audio.onended = () => {
    if (settings.isRepeat) {
      audio.play();
    } else {
      transferSong(true);
    }
  };

  // Handle to rotate the cd
  const cdAnimation = cd.animate([{ transform: "rotate(360deg)" }], {
    duration: 20000,
    iterations: Infinity,
  });
  cdAnimation.pause();
  // Handle when playing a song
  audio.onplay = () => {
    cdAnimation.play();
  };

  audio.onpause = () => {
    cdAnimation.pause();
  };
  //#end region

  // Handle when click at a song in playlist
  playList.onclick = (event) => {
    const selectedSong = event.target.closest(".song:not(.active)");
    if (
      event.target.closest &&
      !event.target.closest(".options") &&
      selectedSong
    ) {
      currentSongIndex = Number(selectedSong.dataset.index);
      loadCurrentSong();
      audio.play();
    }
  };
};

/**
 * Render UI
 */
const render = () => {
  // songs list
  const songs = SONGS_CONFIG.map((song, index) => {
    return `<div class="song flex flex-center mt-1 ${
      currentSongIndex == index ? "active" : ""
    }" data-index=${index}>
    <img class="avatar mr-1" src=${song.image} />
    <div class="song_info flex-column flex1">
    <h3 class="title mb-1">${song.name}</h3>
    <p class="singer">${song.singer}</p>
    </div>
    <!-- <button class="options">...</button> -->
    </div>`;
  });
  $(".songs").innerHTML = songs.join("");

  // Icons
  pauseIcon.style.display = "none";
};

const formatTime = (seconds) => {
  seconds = seconds ? seconds : 0;
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${formatNumber(min)}:${formatNumber(sec)}`;
};

const formatNumber = (number) => {
  if (number < 10) {
    return `0${number}`;
  }
  return number;
};

/**
 * Get current song with index
 */
const getCurrentSong = () => {
  return SONGS_CONFIG[currentSongIndex ?? 0];
};

/**
 * Update UI following selected song
 */
const loadCurrentSong = () => {
  // Update song information
  const currentSong = getCurrentSong();
  $("#current_song .title").textContent = currentSong.name;
  $("#current_song .singer").textContent = currentSong.singer;
  cd.src = currentSong.image;
  audio.src = currentSong.path;

  // Update play list
  const currentSongElement = $$(".songs .song")[currentSongIndex];
  $(".song.active")?.classList.remove("active");
  currentSongElement?.classList.add("active");
  // Scroll to view
  currentSongElement?.scrollIntoView({
    behavior: "smooth",
    block: "end",
    inline: "nearest",
  });
};

const start = () => {
  handleEvents();

  loadCurrentSong();

  render();
};

start();
