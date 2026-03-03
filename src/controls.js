import { searchCatalog, BLACK_HOLE_CATALOG } from './catalog.js';

/**
 * Controls module: wires UI elements to shader uniforms and manages search/catalog.
 */
export class Controls {
  constructor(uniforms, camera, orbitControls) {
    this.uniforms = uniforms;
    this.camera = camera;
    this.orbitControls = orbitControls;
    this.currentBlackHole = null;
    this.onSelect = null; // callback when a black hole is selected

    this.setupSliders();
    this.setupSearch();
    this.setupDiskToggle();

    // Select default black hole
    this.selectBlackHole(BLACK_HOLE_CATALOG.find(bh => bh.id === 'm87-star'));
  }

  setupSliders() {
    const sliderMap = [
      { id: 'spin-slider', display: 'spin-value', uniform: 'uSpinParameter', decimals: 3 },
      { id: 'brightness-slider', display: 'brightness-value', uniform: 'uDiskBrightness', decimals: 2 },
      { id: 'temperature-slider', display: 'temperature-value', uniform: 'uDiskTemperature', decimals: 0 },
      { id: 'doppler-slider', display: 'doppler-value', uniform: 'uDopplerIntensity', decimals: 2 },
      { id: 'quality-slider', display: 'quality-value', uniform: 'uMaxSteps', decimals: 0 },
    ];

    sliderMap.forEach(({ id, display, uniform, decimals }) => {
      const slider = document.getElementById(id);
      const valueDisplay = document.getElementById(display);
      if (!slider || !valueDisplay) return;

      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        valueDisplay.textContent = val.toFixed(decimals);
        if (this.uniforms[uniform]) {
          this.uniforms[uniform].value = uniform === 'uMaxSteps' ? Math.round(val) : val;
        }
      });
    });
  }

  setupDiskToggle() {
    const toggle = document.getElementById('disk-toggle');
    if (toggle) {
      toggle.addEventListener('change', () => {
        if (this.uniforms.uShowDisk) {
          this.uniforms.uShowDisk.value = toggle.checked;
        }
      });
    }
  }

  setupSearch() {
    const input = document.getElementById('search-input');
    const dropdown = document.getElementById('search-dropdown');
    if (!input || !dropdown) return;

    // Show all on focus
    input.addEventListener('focus', () => {
      this.showSearchResults(searchCatalog(input.value));
    });

    // Filter on input
    input.addEventListener('input', () => {
      this.showSearchResults(searchCatalog(input.value));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#search-container')) {
        dropdown.classList.remove('active');
      }
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
      const items = dropdown.querySelectorAll('.search-result-item');
      const active = dropdown.querySelector('.search-result-item.active');
      let idx = Array.from(items).indexOf(active);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        idx = Math.min(idx + 1, items.length - 1);
        items.forEach(i => i.classList.remove('active'));
        items[idx]?.classList.add('active');
        items[idx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        idx = Math.max(idx - 1, 0);
        items.forEach(i => i.classList.remove('active'));
        items[idx]?.classList.add('active');
        items[idx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (active) {
          const bh = BLACK_HOLE_CATALOG.find(b => b.id === active.dataset.id);
          if (bh) this.selectBlackHole(bh);
          dropdown.classList.remove('active');
          input.blur();
        }
      } else if (e.key === 'Escape') {
        dropdown.classList.remove('active');
        input.blur();
      }
    });
  }

  showSearchResults(results) {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;

    const categoryColors = {
      'Supermassive': '#ff6a00',
      'Stellar': '#00c8ff',
      'Ultramassive': '#ff2d55',
      'Fictional': '#a855f7',
      'Theoretical': '#10b981'
    };

    dropdown.innerHTML = results.map(bh => `
      <div class="search-result-item" data-id="${bh.id}">
        <div class="result-dot" style="background: ${categoryColors[bh.category] || '#888'}"></div>
        <div class="result-info">
          <span class="result-name">${bh.name}</span>
          <span class="result-mass">${bh.mass}</span>
        </div>
        <span class="result-badge" style="color: ${categoryColors[bh.category] || '#888'}; border-color: ${categoryColors[bh.category] || '#888'}40">${bh.category}</span>
      </div>
    `).join('');

    dropdown.classList.add('active');

    // Click handlers
    dropdown.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const bh = BLACK_HOLE_CATALOG.find(b => b.id === item.dataset.id);
        if (bh) {
          this.selectBlackHole(bh);
          dropdown.classList.remove('active');
          document.getElementById('search-input').value = '';
          document.getElementById('search-input').blur();
        }
      });
    });
  }

  selectBlackHole(bh) {
    this.currentBlackHole = bh;

    // Update info card
    document.getElementById('info-name').textContent = bh.name;
    document.getElementById('info-category').textContent = bh.category;
    document.getElementById('info-category').className = 'category-badge cat-' + bh.category.toLowerCase();
    document.getElementById('info-mass').textContent = bh.mass;
    document.getElementById('info-spin').textContent = bh.spin.toFixed(3);
    document.getElementById('info-distance').textContent = bh.distance;
    document.getElementById('info-type').textContent = bh.category;
    document.getElementById('info-description').textContent = bh.description;

    // Update shader uniforms
    this.setSlider('spin-slider', 'spin-value', bh.spin, 3);
    this.setSlider('brightness-slider', 'brightness-value', bh.diskBrightness, 2);
    this.setSlider('temperature-slider', 'temperature-value', bh.diskTemp, 0);

    if (this.uniforms.uSpinParameter) this.uniforms.uSpinParameter.value = bh.spin;
    if (this.uniforms.uDiskBrightness) this.uniforms.uDiskBrightness.value = bh.diskBrightness;
    if (this.uniforms.uDiskTemperature) this.uniforms.uDiskTemperature.value = bh.diskTemp;
    if (this.uniforms.uDiskInner) this.uniforms.uDiskInner.value = bh.diskInner;
    if (this.uniforms.uDiskOuter) this.uniforms.uDiskOuter.value = bh.diskOuter;

    // Dynamically adjust camera distance based on diskOuter so it's always visible
    // For a dramatic view, position it at a radius of ~1.5x to 2x the disk size, elevated
    if (this.camera && this.orbitControls) {
      const targetDist = Math.max(18, bh.diskOuter * 1.5);
      const elevation = targetDist * 0.6; // ~30 degree elevation
      const distance = targetDist * 0.8;

      // Animate or set camera position
      this.camera.position.set(0, elevation, distance);
      this.orbitControls.target.set(0, 0, 0);
      this.orbitControls.update();
    }

    if (this.onSelect) this.onSelect(bh);
  }

  setSlider(sliderId, displayId, value, decimals) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (slider) slider.value = value;
    if (display) display.textContent = value.toFixed(decimals);
  }

  updateFPS(fps) {
    const el = document.getElementById('fps-counter');
    if (el) el.textContent = `${Math.round(fps)} FPS`;
  }

  updateResolution(w, h) {
    const el = document.getElementById('resolution-display');
    if (el) el.textContent = `${w}×${h}`;
  }
}
