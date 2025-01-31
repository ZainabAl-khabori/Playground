import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Globe from "globe.gl";

async function renderGlobe(container) {
  async function loadPin() {
    return new Promise(function(resolve) {
      new GLTFLoader().load("./pin.glb", function(gltf) {
        var pin = gltf.scene.children.find(function(c) { return c.isMesh; });
        resolve(pin);
      });
    });
  }

  function createPin(pin) {
    return function() {
      // var r = 8;
      // var h = r * 2;
      // var segments = 360;

      // var cap = new THREE.SphereGeometry(r, segments, segments, 0, Math.PI);
      // cap.rotateX(Math.PI);
      // cap.translate(0, 0, -h);

      // var base = new THREE.ConeGeometry(r, h, segments);
      // base.rotateX(Math.PI / 2);
      // base.translate(0, 0, h / -2);

      // var pin = BufferGeometryUtils.mergeGeometries([base, cap], true);
      // var pinMaterial = new THREE.MeshLambertMaterial({ color: "palevioletred" });
      // var mesh = new THREE.Mesh(pin, pinMaterial);

      // return mesh;

      var geo = pin.geometry;

      // let box = new THREE.Box3().setFromObject(pin);
      // let measure = new THREE.Vector3();
      // let size = box.getSize(measure);

      // geo.rotateX(Math.PI / -2);
      // geo.translate(0, size.x / 2, 0);

      var pinMaterial = new THREE.MeshLambertMaterial({ color: "palevioletred" });
      var mesh = new THREE.Mesh(geo, pinMaterial);

      return mesh;
    }
  }

  function updatePin(obj, p) {
    Object.assign(obj.position, globe.getCoords(p.lat, p.lng, 0));
    obj.lookAt(0, 0, 0);
  }

  function rotateClouds(clouds) {
    clouds.rotation.y += -0.006 * (Math.PI / 180);
    requestAnimationFrame(function() { rotateClouds(clouds); });
  }

  var w = $(container).width();
  var h = $(container).height();

  var lat = 23.594439;
  var lng = 58.366840;
  var pinData = [{ lat, lng }, { lat: -28.105229, lng: 24.628755 }, { lat: 76.295604, lng: 27.617036 }];

  var pin = await loadPin();

  var globe = new Globe(container)
    .width(w)
    .height(h)
    .globeImageUrl("./earth-blue-marble.jpg")
    .bumpImageUrl("./earth-topology.png")
    .backgroundImageUrl("./earth-night-sky.png")
    .pointOfView({ lat, lng })
    .customLayerData(pinData)
    .customThreeObject(createPin(pin))
    .customThreeObjectUpdate(updatePin);

  var globeMaterial = globe.globeMaterial();
  globeMaterial.bumpScale = 15;

  var light = globe.lights().find(function(l) { return l.type === "DirectionalLight"; });
  if (light) { light.position.set(1, 1, 1); }

  var controls = globe.controls();
  controls.minDistance = 250;
  controls.maxDistance = 500;
  // controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;

  new THREE.TextureLoader().load("./earth-texture.png", function(texture) {
    globeMaterial.specularMap = texture;
    globeMaterial.specular = new THREE.Color("grey");
    globeMaterial.shininess = 15;
  });

  new THREE.TextureLoader().load("./earth-clouds.png", function(texture) {
    var sphere = new THREE.SphereGeometry(globe.getGlobeRadius() * (1 + 0.004), 75, 75);
    var cloudsMaterial = new THREE.MeshPhongMaterial({ map: texture, transparent: true });
    var clouds = new THREE.Mesh(sphere, cloudsMaterial);

    globe.scene().add(clouds);
    rotateClouds(clouds);
  });
}

$(".globe").each(function() {
  renderGlobe(this);
});
