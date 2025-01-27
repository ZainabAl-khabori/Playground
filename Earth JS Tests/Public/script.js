import * as THREE from "three";
import Globe from "globe.gl";

function renderGlobe(container) {
  var w = $(container).width();
  var h = $(container).height();

  var globe = new Globe(container)
    .width(w)
    .height(h)
    .globeImageUrl("./earth-blue-marble.jpg")
    .bumpImageUrl("./earth-topology.jpg")
    .backgroundImageUrl("./earth-night-sky.png");

  var material = globe.globeMaterial();
  material.bumpScale = 10;

  new THREE.TextureLoader().load("./earth-water.png", function(texture) {
    material.specularMap = texture;
    material.specular = THREE.Color("grey");
    material.shininess = 15;
  });
}

$(".globe").each(function() {
  renderGlobe(this);
});
