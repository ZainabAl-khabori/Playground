import * as THREE from "./three.module.js";

function renderGlobe(container) {
  var w = $(container).width();
  var h = $(container).height();

  var renderer = new THREE.WebGLRenderer();
  var camera = new THREE.PerspectiveCamera(45, w / h, 1, 2000);
  var scene = new THREE.Scene();

  renderer.setSize(w, h);
  camera.position.set(0.5, 0.5, 1);
  scene.background = new THREE.Color(0x000a88);

  scene.add(camera);
  $(container).append(renderer.domElement);
}

$(".globe").each(function() {
  renderGlobe(this);
});
