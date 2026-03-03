precision highp float;

varying vec2 vUv;

// Camera & viewport
uniform vec2 uResolution;
uniform vec3 uCameraPos;
uniform mat4 uCameraRotation;
uniform float uFOV;

// Black hole parameters
uniform float uSpinParameter;    // 0 = Schwarzschild, up to 0.998
uniform float uSchwarzschildRadius; // = 2GM/c² (normalized to 1.0)

// Accretion disk
uniform bool uShowDisk;
uniform float uDiskInner;        // inner disk radius (ISCO)
uniform float uDiskOuter;        // outer disk radius
uniform float uDiskBrightness;
uniform float uDiskTemperature;  // color temperature
uniform float uDopplerIntensity;

// Quality
uniform int uMaxSteps;

// Starfield cubemap
uniform samplerCube uStarfield;

// Time for animation
uniform float uTime;

#define PI 3.14159265359
#define RS 1.0

// ─────────────────────────────────────────────
// Color from temperature (simplified blackbody)
// ─────────────────────────────────────────────
vec3 blackbodyColor(float temp) {
    // Attempt a physically-inspired temperature-to-color mapping
    float t = clamp(temp / 10000.0, 0.1, 4.0);
    vec3 color;
    // Red channel
    if (t < 0.55) color.r = 1.0;
    else color.r = 0.39 * pow(t - 0.1, -0.75);
    // Green channel
    if (t < 0.55) color.g = 0.11 * sqrt(t) + 0.39 * t;
    else color.g = 0.65 * pow(t + 0.1, -0.25);
    // Blue channel
    if (t < 0.4) color.b = 0.0;
    else if (t < 0.65) color.b = 0.3 * (t - 0.4);
    else color.b = 0.57 * pow(t - 0.1, -0.15) - 0.2;
    
    return clamp(color, 0.0, 1.0);
}

// ─────────────────────────────────────────────
// Hash functions for procedural starfield
// ─────────────────────────────────────────────
float hash(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
}

vec3 hash3(vec3 p) {
    return vec3(hash(p), hash(p + 71.0), hash(p + 137.0));
}

float hash2D(vec2 p) {
    p = fract(p * vec2(443.897, 441.423));
    p += dot(p, p.yx + 19.19);
    return fract(p.x * p.y);
}

vec2 hash2D_2(vec2 p) {
    return vec2(hash2D(p), hash2D(p + 71.0));
}

// Efficient star layer using 2D spherical projection
// Maps direction to spherical coordinates, then does a 2D grid lookup
// with smooth Gaussian falloff around each star center.
float starLayer2D(vec3 dir, float scale, float threshold, float pointSize) {
    // Convert direction to spherical coordinates
    float phi = atan(dir.z, dir.x); // -PI to PI
    float theta = acos(clamp(dir.y, -1.0, 1.0)); // 0 to PI
    
    vec2 uv = vec2(phi / (2.0 * PI) + 0.5, theta / PI);
    uv *= scale;
    
    vec2 cell = floor(uv);
    vec2 frac_pos = fract(uv);
    
    float brightness = 0.0;
    
    // Only check 2x2 neighborhood (4 iterations instead of 27!)
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 nc = cell + neighbor;
            float h = hash2D(nc);
            
            if (h < threshold) continue;
            
            // Random star position within cell
            vec2 starPos = hash2D_2(nc) * 0.8 + 0.1;
            vec2 diff = neighbor + starPos - frac_pos;
            float dist = length(diff);
            
            // Sharp Gaussian falloff
            float star = exp(-dist * dist / (pointSize * pointSize));
            float mag = pow((h - threshold) / (1.0 - threshold), 1.5);
            brightness += star * mag;
        }
    }
    
    return brightness;
}

// ─────────────────────────────────────────────
// Procedural starfield — smooth point stars
// ─────────────────────────────────────────────
vec3 proceduralStarfield(vec3 dir) {
    vec3 color = vec3(0.0);
    
    // Layer 1: Dense dim pin-point stars  
    float s1 = starLayer2D(dir, 200.0, 0.93, 0.035);
    vec2 uv1 = vec2(atan(dir.z, dir.x), acos(clamp(dir.y, -1.0, 1.0)));
    vec2 cell1 = floor(uv1 * 200.0 / (2.0 * PI));
    vec3 starColor1 = mix(
        vec3(0.7, 0.8, 1.0),
        vec3(1.0, 0.95, 0.85),
        hash2D(cell1 + 300.0)
    );
    color += starColor1 * s1 * 0.6;
    
    // Layer 2: Medium bright stars
    float s2 = starLayer2D(dir, 80.0, 0.95, 0.025);
    vec2 uv2 = vec2(atan(dir.z, dir.x), acos(clamp(dir.y, -1.0, 1.0)));
    vec2 cell2 = floor(uv2 * 80.0 / (2.0 * PI));
    vec3 starColor2 = mix(
        vec3(0.85, 0.88, 1.0),
        vec3(1.0, 0.92, 0.75),
        hash2D(cell2 + 400.0)
    );
    if (hash2D(cell2 + 500.0) > 0.85) {
        starColor2 = vec3(1.0, 0.55, 0.3); // Red giants
    }
    color += starColor2 * s2 * 1.5;
    
    // Layer 3: Sparse brilliant stars  
    float s3 = starLayer2D(dir, 30.0, 0.97, 0.015);
    color += vec3(1.0, 0.97, 0.92) * s3 * 3.0;
    
    // Very subtle nebula / background glow
    float nebula = 0.0;
    nebula += 0.012 * max(0.0, sin(dir.x * 2.5 + dir.y * 1.5) * sin(dir.z * 2.0 + dir.x * 1.2));
    nebula += 0.006 * max(0.0, cos(dir.y * 3.0 + dir.z * 2.5) * sin(dir.x * 1.8));
    color += vec3(0.10, 0.03, 0.18) * nebula;
    color += vec3(0.03, 0.05, 0.10) * max(0.0, sin(dir.y * 4.0 + dir.z * 3.0) * 0.01);
    
    return max(color, vec3(0.001, 0.002, 0.004));
}

// ─────────────────────────────────────────────
// ISCO (innermost stable circular orbit) for Kerr
// ─────────────────────────────────────────────
float computeISCO(float a) {
    // For prograde orbits around Kerr black hole
    float z1 = 1.0 + pow(1.0 - a*a, 1.0/3.0) * (pow(1.0 + a, 1.0/3.0) + pow(1.0 - a, 1.0/3.0));
    float z2 = sqrt(3.0 * a*a + z1*z1);
    return 3.0 + z2 - sqrt((3.0 - z1) * (3.0 + z1 + 2.0*z2));
}

// ─────────────────────────────────────────────
// Main ray-march through Schwarzschild/Kerr spacetime
// ─────────────────────────────────────────────
void main() {
    // Aspect-corrected UV
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    
    // Ray direction from camera
    float fovRad = uFOV * PI / 180.0;
    vec3 rd = normalize(vec3(uv * tan(fovRad * 0.5), -1.0));
    rd = (uCameraRotation * vec4(rd, 0.0)).xyz;
    
    vec3 ro = uCameraPos;
    
    // Ray march state
    vec3 pos = ro;
    vec3 vel = rd;
    
    float stepSize = 0.08;
    float rs = RS; // Schwarzschild radius
    float a = uSpinParameter;
    
    vec3 accumulatedColor = vec3(0.0);
    float accumulatedAlpha = 0.0;
    int diskCrossings = 0; // Allow multiple crossings for secondary images
    bool hitHorizon = false;
    float closestApproach = 1000.0;
    
    // Adaptive step size
    float prevY = pos.y;
    
    for (int i = 0; i < 400; i++) {
        if (i >= uMaxSteps) break;
        
        float r = length(pos);
        closestApproach = min(closestApproach, r);
        
        // Event horizon check (Kerr: r+ = 1 + sqrt(1 - a²) in rs/2 units)
        float rHorizon = 0.5 * rs * (1.0 + sqrt(max(0.0, 1.0 - a*a)));
        
        if (r < rHorizon) {
            hitHorizon = true;
            break;
        }
        
        // Escape check
        if (r > 50.0) {
            break;
        }
        
        // ── Gravitational acceleration ──
        // Schwarzschild-like potential with Kerr corrections
        float r2 = r * r;
        float r3 = r2 * r;
        float r5 = r2 * r3;
        
        // Base Newtonian-like gravity (Schwarzschild geodesic approx)
        vec3 grav = -1.5 * rs * pos / r3;
        
        // Kerr frame-dragging correction
        if (a > 0.001) {
            // Frame dragging: spacetime is dragged in the phi direction
            // This creates a torque perpendicular to both the spin axis and radial direction
            vec3 spinAxis = vec3(0.0, 1.0, 0.0);
            vec3 radial = pos / r;
            vec3 frameDrag = cross(spinAxis, radial);
            float dragStrength = 2.0 * a * rs * rs / (r3 + a*a*r);
            grav += frameDrag * dragStrength * length(vel);
            
            // Oblate correction to the shadow
            float cosTheta = pos.y / r;
            float oblateFactor = 1.0 + 0.5 * a*a * (1.0 - cosTheta*cosTheta) / r2;
            grav *= oblateFactor;
        }
        
        // Angular momentum correction for photon orbits
        // This creates the photon sphere at r = 1.5*rs
        float L2 = dot(cross(pos, vel), cross(pos, vel));
        vec3 angMomForce = -L2 * pos / r5 * rs;
        
        vec3 totalAccel = grav + angMomForce * 0.5;
        
        // Adaptive step size - smaller near the black hole
        stepSize = 0.02 + 0.15 * smoothstep(1.5, 20.0, r);
        // Even smaller near photon sphere
        if (r < 3.0 * rs) {
            stepSize *= 0.3;
        }
        
        // ── Check accretion disk crossing (multiple crossings for lensed images) ──
        float newY = pos.y + vel.y * stepSize;
        if (uShowDisk && prevY * newY < 0.0 && diskCrossings < 3) {
            // Crossed the equatorial plane - find intersection
            float t = -pos.y / vel.y;
            vec3 diskPoint = pos + vel * t;
            float diskR = length(diskPoint.xz);
            
            float isco = computeISCO(a) * rs * 0.5;
            float innerR = max(isco, uDiskInner);
            float outerR = uDiskOuter;
            
            if (diskR > innerR && diskR < outerR) {
                diskCrossings++;
                
                // Disk position angle for Doppler effect
                float phi = atan(diskPoint.z, diskPoint.x);
                
                // Keplerian orbital velocity at this radius
                float orbitalV = sqrt(rs / (2.0 * diskR));
                
                // Doppler factor: blueshift on approaching side, redshift on receding
                vec3 orbitalDir = normalize(vec3(-sin(phi), 0.0, cos(phi)));
                vec3 toCamera = normalize(uCameraPos - diskPoint);
                float dopplerFactor = 1.0 + uDopplerIntensity * orbitalV * dot(orbitalDir, toCamera);
                dopplerFactor = clamp(dopplerFactor, 0.2, 3.0);
                
                // Temperature varies with radius (hotter near ISCO)
                float radialFrac = (diskR - innerR) / (outerR - innerR);
                float localTemp = uDiskTemperature * pow(innerR / diskR, 0.75);
                // Apply Doppler to temperature
                localTemp *= dopplerFactor;
                
                // Brightness falls off with radius
                float brightness = uDiskBrightness * pow(1.0 - radialFrac, 0.6);
                brightness *= dopplerFactor * dopplerFactor; // Doppler beaming ∝ δ²
                
                // Gravitational redshift
                float gravRedshift = sqrt(max(0.01, 1.0 - rs / diskR));
                brightness *= gravRedshift;
                
                // Color from temperature
                vec3 diskColor = blackbodyColor(localTemp);
                
                // Add some texture/turbulence to the disk
                float turbulence = 0.7 + 0.3 * sin(phi * 8.0 + uTime * 0.5 + diskR * 5.0);
                turbulence *= 0.8 + 0.2 * sin(phi * 13.0 - uTime * 0.3 + diskR * 3.0);
                brightness *= turbulence;
                
                // Inner edge glow
                float innerGlow = exp(-3.0 * (diskR - innerR) / innerR);
                diskColor += vec3(0.5, 0.7, 1.0) * innerGlow * 0.5;
                
                // Secondary images are dimmer
                float crossingFade = (diskCrossings == 1) ? 1.0 : 0.5 / float(diskCrossings);
                accumulatedColor += diskColor * brightness * crossingFade;
                accumulatedAlpha = min(accumulatedAlpha + brightness * 0.8 * crossingFade, 1.0);
            }
        }
        prevY = pos.y;
        
        // ── RK4-ish integration ──
        vec3 k1v = totalAccel;
        vec3 midPos = pos + vel * stepSize * 0.5;
        float midR = length(midPos);
        float midR3 = midR * midR * midR;
        vec3 k2v = -1.5 * rs * midPos / midR3;
        
        vel += (k1v + k2v) * 0.5 * stepSize;
        vel = normalize(vel); // Keep ray null (lightlike)
        pos += vel * stepSize;
    }
    
    // ── Final color compositing ──
    vec3 finalColor = vec3(0.0);
    
    if (hitHorizon) {
        // Pure black inside event horizon - NO gray!
        finalColor = vec3(0.0);
        
        // Subtle edge glow at the horizon boundary
        float edgeGlow = exp(-5.0 * (closestApproach - 0.5 * rs));
        finalColor += vec3(0.8, 0.3, 0.0) * edgeGlow * 0.15;
    } else {
        // Ray escaped - sample the starfield
        vec3 starColor = proceduralStarfield(normalize(vel));
        
        // Gravitational lensing brightening near the photon sphere
        float lensBrightening = 1.0 + 2.0 * exp(-2.0 * (closestApproach - 1.5 * rs));
        starColor *= lensBrightening;
        
        finalColor = starColor;
    }
    
    // Composite accretion disk on top
    finalColor = mix(finalColor, accumulatedColor, min(accumulatedAlpha, 1.0));
    
    // ── Photon sphere ring ──
    float photonR = 1.5 * rs;
    float ringGlow = exp(-8.0 * abs(closestApproach - photonR));
    finalColor += vec3(1.0, 0.7, 0.3) * ringGlow * 0.6;
    
    // ── Post-processing ──
    // Output raw HDR values so Three.js UnrealBloomPass and OutputPass can handle tonemapping
    // Slight contrast boost before bloom
    finalColor = pow(max(finalColor, 0.0), vec3(0.95));
    
    // Subtle vignette
    vec2 vigUV = vUv - 0.5;
    float vig = 1.0 - 0.3 * dot(vigUV, vigUV);
    finalColor *= vig;
    
    // Gamma
    finalColor = pow(finalColor, vec3(1.0/2.2));
    
    gl_FragColor = vec4(finalColor, 1.0);
}
