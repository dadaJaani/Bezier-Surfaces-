/*
CS 465 - Computer Graphics
Assignment 3 - Bezier Surfaces

Waqas Rehmani
21424884

This is the JavaScript file for the Quadruped Animal Assignment.
It uses hierarchical modelling and animations using transformations.
This file initalizes the WebGL and menu.

Also, a large part of the code used here was learned from the humanoid figure
example given with the course material.

*/

// ========================================================================
// Initalizing the global variables
// ========================================================================
var canvas
var gl
var fColor

var uSampler
var projectionMatrix
var modelViewMatrix
var normalMatrix
var normalMatrixLoc
var instanceMatrix
var modelViewMatrixLoc

var controlPoints = [
  [
    vec3 ( -50.0, 50.0, 0),
    vec3 (   0.0, 50.0, 0 ),
    vec3 (  50.0, 50.0, 0 ),
  ],
  [
    vec3 ( -50.0,  0.0, 0.0 ),
    vec3 (   0.0,  0.0, 0.0 ),
    vec3 (  50.0,  0.0, 0.0 ),
  ],
  [
    vec3 ( -50.0, -50.0, 0.0 ),
    vec3 (   0.0, -50.0, 0.0 ),
    vec3 (  50.0, -50.0, 0.0 ),
  ],
]

var controlPointsDisplay = []

var noControlPointsU = 3
var noControlPointsV = 3

var noBezierCurvePoints = 6

var showMesh = false
var showGouraud = false
var showPhong = false
var showTexture = false

var vBuffer
var modelViewLoc

var pointsArray = []
var meshArray = []
var binomialsU = []
var binomialsV = []
var normalsArray = []
var textureArray = []

var selected = []

var xRot = 0
var yRot = 0
var zRot = 0

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;

var viewerPos;
var shadingMode

var texture1
var texture2



// ========================================================================
//  Defining side menu controls
// ========================================================================

// This function resizes the elements of the page when we resize the window
window.onresize = function(event) {
  canvas = document.getElementById( 'gl-canvas' )
  side = document.getElementById( 'side-menu' )
  side.setAttribute("style","width:250px")
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth - side.offsetWidth
}

// This function is run when the page loads the first time.
window.onload = function() {
  // Setting the sizes for the canvas and menu
  canvas = document.getElementById( 'gl-canvas' )
  side = document.getElementById( 'side-menu' )
  sideLeft = document.getElementById( 'side-menu-left' )
  side.setAttribute("style","width:250px")
  sideLeft.setAttribute("style","width:250px")
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth - 2*side.offsetWidth
  canvas.style.position = "absolute";
  canvas.style.left = side.offsetWidth+"px"

  // This method initalizes the vertices using mouse events
  start()
  // This method initalizes the menu
  initializeMenu()
}

// ==========================================================================
//  INITALIZING THE MENU
// ==========================================================================
initializeMenu = () => {

  // ========================================================================
  //  Sliders for body parts
  // ========================================================================
  // Getting the sliders
  var xValueSlider = document.getElementById( 'xValueSlider' )
  var yValueSlider = document.getElementById( 'yValueSlider' )
  var zValueSlider = document.getElementById( 'zValueSlider' )
  var yValueLabel = document.getElementById( 'xValueLabel' )
  var yValueLabel = document.getElementById( 'yValueLabel' )
  var zValueLabel = document.getElementById( 'zValueLabel' )
  var phongSwitch = document.getElementById( 'phongSwitch' )
  var gouraudSwitch = document.getElementById( 'gouraudSwitch' )
  var meshSwitch = document.getElementById('meshSwitch')
  var textureSwitch = document.getElementById( 'textureSwitch' )
  var nDimSlider = document.getElementById( 'nDimSlider' )
  var mDimSlider = document.getElementById( 'mDimSlider' )
  var nDimLabel = document.getElementById( 'nDimLabel' )
  var mDimLabel = document.getElementById( 'mDimLabel' )
  var xRotSlider = document.getElementById( 'xRotSlider' )
  var yRotSlider = document.getElementById( 'yRotSlider' )
  var zRotSlider = document.getElementById( 'zRotSlider' )
  var xRotLabel = document.getElementById( 'xRotLabel' )
  var yRotLabel = document.getElementById( 'yRotLabel' )
  var zRotLabel = document.getElementById( 'zRotLabel' )
  var subdivSlider = document.getElementById( 'subdivSlider' )
  var subdivLabel = document.getElementById( 'subdivLabel' )


  mDimSlider.value = noControlPointsU
  nDimSlider.value = noControlPointsV
  mDimLabel.innerHTML = noControlPointsU
  nDimLabel.innerHTML = noControlPointsV
  subdivSlider.value = noBezierCurvePoints
  subdivLabel.innerHTML = noBezierCurvePoints

  initRadios = () => {
    list = document.getElementById("list-wrapper");
    list.innerHTML = '';

    for (var i = 0; i < noControlPointsU; i++) {
      let div = document.createElement("div")
      div.classList.add('grid-row')
      document.getElementById("list-wrapper").appendChild(div);
      for (var j = 0; j < noControlPointsV; j++) {
        let radio = document.createElement("input")
        radio.classList.add('grid-point')
        radio.name = 'pointsGrid'
        radio.type = 'radio'
        radio.value = [j,i]
        radio.onclick = (e) => {
          e.preventDefault()
          let temp
          temp = e.target.value.split(',').map(function(item) {
            return parseInt(item, 10);
          })
          this.radioSelect(temp[0], temp[1])
        }
        div.appendChild(radio);
      }
    }
  }

  this.initRadios()


  radioSelect = (i,j) => {
    selected[0] = i
    selected[1] = j

    xValueLabel.innerHTML = controlPoints[j][i][0]
    yValueLabel.innerHTML = controlPoints[j][i][1]
    zValueLabel.innerHTML = controlPoints[j][i][2]
    xValueSlider.value = controlPoints[j][i][0]
    yValueSlider.value = controlPoints[j][i][1]
    zValueSlider.value = controlPoints[j][i][2]
  }

  subdivSlider.oninput = () => {
    noBezierCurvePoints = parseInt(event.srcElement.value)
    subdivLabel.innerHTML = event.srcElement.value
    start()
  }

  xRotSlider.oninput = () => {
    xRot = parseFloat(event.srcElement.value)
    xRotLabel.innerHTML = event.srcElement.value
  }
  yRotSlider.oninput = () => {
    yRot = parseFloat(event.srcElement.value)
    yRotLabel.innerHTML = event.srcElement.value
  }
  zRotSlider.oninput = () => {
    zRot = parseFloat(event.srcElement.value)
    zRotLabel.innerHTML = event.srcElement.value
  }

  xValueSlider.oninput = () => {
    if (selected && selected.length > 0) {
      controlPoints[selected[1]][selected[0]][0] = parseInt(event.srcElement.value)
      xValueLabel.innerHTML = event.srcElement.value
      initGL()
    }
  }

  yValueSlider.oninput = () => {
    if (selected && selected.length > 0) {
      controlPoints[selected[1]][selected[0]][1] = parseInt(event.srcElement.value)
      yValueLabel.innerHTML = event.srcElement.value
      initGL()
    }
  }

  zValueSlider.oninput = () => {
    if (selected && selected.length > 0) {
      controlPoints[selected[1]][selected[0]][2] = parseInt(event.srcElement.value)
      zValueLabel.innerHTML = event.srcElement.value
      initGL()
    }
  }


  meshSwitch.onchange = () => {
    if (meshSwitch.checked) {
      showMesh = true
      gouraudSwitch.checked = false
      phongSwitch.checked = false
      textureSwitch.checked = false
      showGouraud = false
      showPhong = false
      showTexture = false
    } else {
      showMesh = false
    }
    initGL()
  }

  gouraudSwitch.onchange = () => {
    if (gouraudSwitch.checked) {
      showGouraud = true
      meshSwitch.checked = false
      phongSwitch.checked = false
      textureSwitch.checked = false
      showMesh = false
      showPhong = false
      showTexture = false
    } else {
      showGouraud = false
    }
    initGL()
  }

  phongSwitch.onchange = () => {
    if (phongSwitch.checked) {
      showPhong = true
      gouraudSwitch.checked = false
      meshSwitch.checked = false
      textureSwitch.checked = false
      showGouraud = false
      showMesh = false
      showTexture = false
    } else {
      showPhong = false
    }
    initGL()
  }

  textureSwitch.onchange = () => {
    if (textureSwitch.checked) {
      showTexture = true
      gouraudSwitch.checked = false
      meshSwitch.checked = false
      phongSwitch.checked = false
      showGouraud = false
      showMesh = false
      showPhong = false
    } else {
      showTexture = false
    }
    initGL()
  }


  nDimSlider.onchange = () => {
    controlPoints = new Array();
    noControlPointsV = parseInt(event.srcElement.value)

    nDimLabel.innerHTML = event.srcElement.value

    let vertical = 50
    let verticalDivider = 100/ (noControlPointsU-1)
    let horizontalDivider = 100/ (noControlPointsV-1)

    for (var i = 0; i < noControlPointsU; i++) {
      controlPoints[i] = new Array();

      let horizontal = -50
      for (var j = 0; j < noControlPointsV; j++) {
        controlPoints[i].push( vec3(horizontal, vertical, 0.0))
        horizontal = horizontal + horizontalDivider
      }
      vertical = vertical - verticalDivider
    }

    initRadios()
    start()
  }


  mDimSlider.onchange = () => {
    controlPoints = new Array();
    noControlPointsU = parseInt(event.srcElement.value)

    mDimLabel.innerHTML = event.srcElement.value

    let vertical = 50
    let verticalDivider = 100/ (noControlPointsU-1)
    let horizontalDivider = 100/ (noControlPointsV-1)

    for (var i = 0; i < noControlPointsU; i++) {
      controlPoints[i] = new Array();

      let horizontal = -50
      for (var j = 0; j < noControlPointsV; j++) {
        controlPoints[i].push( vec3(horizontal, vertical, 0.0))
        horizontal = horizontal + horizontalDivider
      }
      vertical = vertical - verticalDivider
    }
    initRadios()
    start()
  }

}




// ==========================================================================
//  INITALIZING THE KEYBOARD CONTROLS
// ==========================================================================
// Event Listener to start animation on key held down



computeBinomialCoefficientsU = (n) => {
  for (var k = 0; k <= n; k++) {
    binomialsU[k] = 1;
    for (var j = n; j >= k+1; j--) {
      binomialsU[k] *= j ;
    }
    for (var j=(n-k); j >= 2 ; j--) {
      binomialsU[k] /= j;
    }
  }
}

computeBinomialCoefficientsV = (n) => {
  for (var k = 0; k <= n; k++) {
    binomialsV[k] = 1;
    for (var j = n; j >= k+1; j--) {
      binomialsV[k] *= j ;
    }
    for (var j=(n-k); j >= 2 ; j--) {
      binomialsV[k] /= j;
    }
  }
}


bezier = () => {
  pointsArray = []

  var m = noControlPointsU
  var n = noControlPointsV
  var bezBlendFcnU
  var bezBlendFcnV
  var x = 0
  var y = 0
  var z = 0

  var u = 0
  var v = 0

  computeBinomialCoefficientsU(m-1)
  computeBinomialCoefficientsV(n-1)

  for (var k = 0; k <= noBezierCurvePoints; k++) {
    u = k / noBezierCurvePoints
    for (var l = 0; l <= noBezierCurvePoints; l++) {
      v = l / noBezierCurvePoints

      x = 0
      y = 0
      z = 0

      var qx = 0
      var qy = 0
      var qz = 0

      for (var i = 0; i < m; i++) {
        qx = 0
        qy = 0
        qz = 0
        bezBlendFcnU = binomialsU[i] * Math.pow(v, i) * Math.pow(1 - v, m - 1 - i)
        for (var j = 0; j < n; j++) {
          bezBlendFcnV = binomialsV[j] * Math.pow(u, j) * Math.pow(1 - u, n - 1 - j)
          qx += controlPoints[i][j][0] * bezBlendFcnV
          qy += controlPoints[i][j][1] * bezBlendFcnV
          qz += controlPoints[i][j][2] * bezBlendFcnV
        }
        x += qx * bezBlendFcnU
        y += qy * bezBlendFcnU
        z += qz * bezBlendFcnU
      }
      pointsArray.push(vec3(x, y, z))
    }
  }


  createMesh()
}

createControlPointsDisplay = () => {
  controlPointsDisplay = []
  for (var i = 0; i < noControlPointsU; i++) {
    for (var j = 0; j < noControlPointsV; j++) {
      controlPointsDisplay.push((controlPoints[i][j]))
    }
  }
}

var texCoord = [
    vec2(-1, -1),
    vec2(-1,  1),
    vec2(1, 1),
    vec2(1, -1)
];

createMesh = () => {
  meshArray = []

  for (var i = 0; i < noBezierCurvePoints; i++) {
    for (var j = 0; j < noBezierCurvePoints; j++) {

      var i00 = i     + j    *(noBezierCurvePoints+1)
      var i01 = i     + (j+1)*(noBezierCurvePoints+1)
      var i10 = (i+1) + j    *(noBezierCurvePoints+1)
      var i11 = (i+1) + (j+1)*(noBezierCurvePoints+1)

      var t1 = subtract(pointsArray[i10], pointsArray[i00]);
      var t2 = subtract(pointsArray[i11], pointsArray[i10]);
      var normal = cross(t1, t2);
      var normal = vec3(normal);

      meshArray.push(pointsArray[i00])
      normalsArray.push(normal);
      textureArray.push(texCoord[0])

      meshArray.push(pointsArray[i10])
      normalsArray.push(normal);
      textureArray.push(texCoord[1])

      meshArray.push(pointsArray[i11])
      normalsArray.push(normal);
      textureArray.push(texCoord[2])

      meshArray.push(pointsArray[i00])
      normalsArray.push(normal);
      textureArray.push(texCoord[0])

      meshArray.push(pointsArray[i11])
      normalsArray.push(normal);
      textureArray.push(texCoord[2])

      meshArray.push(pointsArray[i01])
      normalsArray.push(normal);
      textureArray.push(texCoord[3])

    }
  }
}



// function loadTexture(gl, url) {
//   var texture = gl.createTexture();
//   gl.bindTexture(gl.TEXTURE_2D, texture);
//
//   // Because images have to be download over the internet
//   // they might take a moment until they are ready.
//   // Until then put a single pixel in the texture so we can
//   // use it immediately. When the image has finished downloading
//   // we'll update the texture with the contents of the image.
//   const level = 0;
//   const internalFormat = gl.RGBA;
//   const width = 1;
//   const height = 1;
//   const border = 0;
//   const srcFormat = gl.RGBA;
//   const srcType = gl.UNSIGNED_BYTE;
//   const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
//   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]))
//
//   const image = new Image();
//   image.onload = function() {
//     gl.bindTexture(gl.TEXTURE_2D, texture);
//     gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
//       srcFormat, srcType, image);
//
//       // WebGL1 has different requirements for power of 2 images
//       // vs non power of 2 images so check if the image is a
//       // power of 2 in both dimensions.
//       if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
//         // Yes, it's a power of 2. Generate mips.
//         gl.generateMipmap(gl.TEXTURE_2D);
//       } else {
//         // No, it's not a power of 2. Turn of mips and set
//         // wrapping to clamp to edge
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//       }
//     };
//     // img.crossOrigin = ""
//     // requestCORSIfNotSameOrigin(image, url);
//     if ((new URL(url)).origin !== window.location.origin) {
//       image.crossOrigin = "";
//     }
//     image.src = url;
//
//     return texture;
//   }

  function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
  }

  var texSize = 2048;
  var numChecks = 50;

  var image1 = new Uint8Array(4*texSize*texSize);

  for ( var i = 0; i < texSize; i++ ) {
      for ( var j = 0; j <texSize; j++ ) {
          var patchx = Math.floor(i/(texSize/numChecks));
          if(patchx%2) c = 255;
          else c = 0;
          image1[4*i*texSize+4*j] = c;
          image1[4*i*texSize+4*j+1] = c;
          image1[4*i*texSize+4*j+2] = c;
          image1[4*i*texSize+4*j+3] = 255;
      }
  }

  var image2 = new Uint8Array(4*texSize*texSize);

  // Create a checkerboard pattern
  for ( var i = 0; i < texSize; i++ ) {
      for ( var j = 0; j <texSize; j++ ) {
          var patchy = Math.floor(j/(texSize/numChecks));
          if(patchy%2) c = 255;
          else c = 0;
          image2[4*i*texSize+4*j] = c;
          image2[4*i*texSize+4*j+1] = c;
          image2[4*i*texSize+4*j+2] = c;
          image2[4*i*texSize+4*j+3] = 255;
         }
  }


configureTexture = () => {
  texture1 = gl.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, texture1 );
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
  gl.generateMipmap( gl.TEXTURE_2D );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  texture2 = gl.createTexture();
  gl.bindTexture( gl.TEXTURE_2D, texture2 );
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
  gl.generateMipmap( gl.TEXTURE_2D );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}


// ==========================================================================
//  Initalizing GL things
// ==========================================================================
initGL = () => {
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }



  gl.viewport( 0, 0, canvas.width, canvas.height );
  gl.clearColor( 0.0, 0.0, 0.0, 0.2 );

  gl.enable(gl.DEPTH_TEST);


  program = initShaders( gl, "vertex-shader", "fragment-shader");

  gl.useProgram( program);

  bezier()


  // createMesh()

  viewerPos = vec3(0.0, 0.0, -20.0 );

  instanceMatrix = mat4();
  // projectionMatrix = ortho(-100, 100, -100, 100, -100.0, 100.0);
  modelViewMatrix = mat4();

  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);


  gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct));
  gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
  gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
  gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
  gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);
  gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix) );

  // gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix) );

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
  projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix")
  normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix")

  shadingMode = gl.getUniformLocation(program, "mode")

  // picture = loadTexture(gl, 'https://c1.staticflickr.com/9/8873/18598400202_3af67ef38f_q.jpg');

  configureTexture();


  var nBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

  var vNormal = gl.getAttribLocation( program, "vNormal" );
  gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vNormal );

  // meshArray.concat(controlPointsDisplay)

  vBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
  gl.bufferData(gl.ARRAY_BUFFER, flatten(meshArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  var tBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
  gl.bufferData(gl.ARRAY_BUFFER, flatten(textureArray), gl.STATIC_DRAW);

  var tPosition = gl.getAttribLocation( program, "aTextureCoord" );
  gl.vertexAttribPointer( tPosition, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( tPosition );
  // Tell WebGL we want to affect texture unit 0

  uSampler = gl.getUniformLocation(program, 'uSampler'),
  uSampler2 = gl.getUniformLocation(program, 'uSampler2'),

  // gl.activeTexture(gl.TEXTURE0);
  //
  // gl.bindTexture(gl.TEXTURE_2D, texture1);
  //
  // // Tell the shader we bound the texture to texture unit 0
  // gl.uniform1i(uSampler, 0);
  gl.activeTexture( gl.TEXTURE0 );
  gl.bindTexture( gl.TEXTURE_2D, texture1 );
  gl.uniform1i(uSampler, 0);

  gl.activeTexture( gl.TEXTURE1 );
  gl.bindTexture( gl.TEXTURE_2D, texture2 );
  gl.uniform1i(uSampler2, 1);


  fColor = gl.getUniformLocation(program, "fColor");

}

start = () => {
  initGL()

  render();
}


var near = -100;
var far = 100;
var left = -100.0;
var right = 100.0;
var ytop = 100.0;
var bottom = -100.0;


render = () => {
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

  projectionMatrix = ortho(left, right, bottom, ytop, near, far);

  modelViewMatrix = mult(modelViewMatrix, rotate(xRot, 1, 0, 0))
  modelViewMatrix = mult(modelViewMatrix, rotate(yRot, 0, 1, 0))
  modelViewMatrix = mult(modelViewMatrix, rotate(zRot, 0, 0, 1))

  normalMatrix = [
    vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
    vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
    vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
  ];

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
  gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );

  if (showMesh) {
    // gl.uniform4fv(fColor, flatten(vec4(0.05, 0.0, 0.3, 0.5)));
    // gl.drawArrays( gl.TRIANGLES, 0, meshArray.length );
    // gl.uniform4fv(fColor, flatten(vec4(1.0,1,1,0.5)));
    gl.drawArrays( gl.LINE_STRIP, 0, meshArray.length );
    // gl.cullFace(gl.FRONT_AND_BACK);
    gl.uniform1f(shadingMode, 1.0);

  } else if (showGouraud) {
    gl.drawArrays( gl.TRIANGLES, 0, meshArray.length);
    gl.uniform1f(shadingMode, 2.0);
  } else if (showPhong) {
    gl.drawArrays( gl.TRIANGLES, 0, meshArray.length);
    gl.uniform1f(shadingMode, 3.0);
  } else if (showTexture) {

    // gl.activeTexture(gl.TEXTURE0);
    // // Bind the texture to texture unit 0
    // gl.bindTexture(gl.TEXTURE_2D, picture);
    //
    // // Tell the shader we bound the texture to texture unit 0
    // gl.uniform1i(uSampler, 0);

    gl.drawArrays( gl.TRIANGLES, 0, meshArray.length);
    gl.uniform1f(shadingMode, 4.0);
  } else {
    gl.drawArrays( gl.POINTS, 0, meshArray.length );
    gl.uniform1f(shadingMode, 0.0);
  }





  requestAnimFrame( render );
}
