let L, beta, lattice;
let stepsPerFrame = 1;
let boundary = "periodic";

let expTable = {};  // precomputed Metropolis probabilities
let indices = [];   // shuffled lattice indices for random sequential updates

onmessage = function(e) {
  const data = e.data;
  if(data.type === "init") {
    L = data.L;
    beta = data.beta;
    lattice = new Int8Array(L*L);
    for(let i=0;i<L*L;i++) lattice[i] = Math.random()<0.5?1:-1;
    precomputeExp();
    createIndices();
    runSimulation();
  } else if(data.type === "setBeta") {
    beta = data.beta;
    precomputeExp();
  } else if(data.type === "setSpeed") {
    stepsPerFrame = data.steps;
  } else if(data.type === "setBoundary") {
    boundary = data.boundary;
  }
};

function precomputeExp() {
  // possible ΔE values: 4, 8
  expTable[4] = Math.exp(-beta*4);
  expTable[8] = Math.exp(-beta*8);
}

function getSpin(i,j) {
  if(boundary === "periodic") return lattice[((i+L)%L)*L + ((j+L)%L)];
  else if(boundary === "fixedUp") {
    if(i<0||i>=L||j<0||j>=L) return 1;
    return lattice[i*L+j];
  } else if(boundary === "fixedDown") {
    if(i<0||i>=L||j<0||j>=L) return -1;
    return lattice[i*L+j];
  }
}

// Create shuffled indices for random sequential updates
function createIndices() {
  indices = new Array(L*L);
  for(let i=0;i<L*L;i++) indices[i]=i;
}

// Fisher-Yates shuffle
function shuffleIndices() {
  for(let i=indices.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
}

// Fully random sequential Metropolis sweep
function metropolisStep() {
  shuffleIndices();
  for(let k=0;k<indices.length;k++){
    const idx = indices[k];
    const i = Math.floor(idx/L);
    const j = idx % L;
    const s = lattice[idx];
    const nb = getSpin(i+1,j)+getSpin(i-1,j)+getSpin(i,j+1)+getSpin(i,j-1);
    const dE = 2*s*nb;
    if(dE<=0 || Math.random()<expTable[dE] || (dE===0 && Math.random()<0.5)) {
      lattice[idx] = -s;
    }
  }
}

let latticeReady = false;

// Simulation loop
function runSimulation() {
  // simulation updates as fast as possible
  function simLoop() {
    for(let i=0;i<stepsPerFrame;i++) metropolisStep();
    latticeReady=true;
    setTimeout(simLoop,0);
  }
  simLoop();

  // Send frames at ~30fps
  setInterval(()=>{
    if(!latticeReady) return;
    latticeReady=false;

    let sum = 0;
    for(let i=0;i<lattice.length;i++) sum+=lattice[i];
    const M = sum / lattice.length;

    postMessage({type:"frame", lattice:lattice, mag:M});
  },33); // ~30fps
}
