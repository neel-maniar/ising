let L;
let beta;
let lattice;

onmessage = function(e) {
  const data = e.data;
  if (data.type === "init") {
    L = data.L;
    beta = data.beta;
    lattice = new Int8Array(L*L);
    for (let i = 0; i < L*L; i++) {
      lattice[i] = Math.random() < 0.5 ? 1 : -1;
    }
    runSimulation();
  } else if (data.type === "setBeta") {
    beta = data.beta;
  }
};

// Metropolis step
function metropolisStep() {
  for (let n = 0; n < L*L; n++) {
    const i = Math.floor(Math.random() * L);
    const j = Math.floor(Math.random() * L);
    const idx = i*L + j;
    const s = lattice[idx];

    // neighbors (periodic boundary)
    const nb = lattice[((i+1)%L)*L + j] + lattice[((i-1+L)%L)*L + j] +
               lattice[i*L + ((j+1)%L)] + lattice[i*L + ((j-1+L)%L)];

    const dE = 2 * s * nb;
    if (dE <= 0 || Math.random() < Math.exp(-beta*dE)) {
      lattice[idx] = -s;
    }
  }
}

// Simulation loop
function runSimulation() {
  setInterval(() => {
    metropolisStep();

    // compute magnetization
    let sum = 0;
    for (let i = 0; i < lattice.length; i++) sum += lattice[i];
    const M = sum / lattice.length;

    postMessage({ type: "frame", lattice: lattice, mag: M });
  }, 30);
}
