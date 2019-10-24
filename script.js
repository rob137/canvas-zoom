//phrogz.net/tmp/canvas_zoom_to_cursor.html
const canvas = document.getElementsByTagName('canvas')[0];
canvas.width = 800; canvas.height = 800;
const img = new Image;
// const img2 = new Image;
img.src = 'tomatoes.jpg';
// img2.src = 'tomatoes.jpg';
window.onload = function(){		
  const ctx = canvas.getContext('2d');
  trackTransforms(ctx);
  function redraw(){
    // Clear the entire canvas
    const p1 = ctx.transformedPoint(0,0);
    const p2 = ctx.transformedPoint(canvas.width,canvas.height);
    ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);

    // get the correct image ratio
    var hRatio = canvas.width / img.width;
    var vRatio = (canvas.height - 50) / img.height;
    var ratio = Math.min( hRatio, vRatio );
    // center the image
    var centerShift_x = ( canvas.width - img.width*ratio ) / 2;
    var centerShift_y = ( canvas.height - img.height*ratio ) / 2;
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img, 0,0, img.width, img.height,
      centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);
  }

  redraw();

  let lastX=canvas.width, lastY=canvas.height;
  let dragStart,dragged;
  canvas.addEventListener('mousedown',function(e){
    document.body.style.mozUserSelect =
      document.body.style.webkitUserSelect =
      document.body.style.userSelect = 'none';
    lastX = e.offsetX || (e.pageX - canvas.offsetLeft);
    lastY = e.offsetY || (e.pageY - canvas.offsetTop);
    dragStart = ctx.transformedPoint(lastX,lastY);
    dragged = false;
  },false);
  canvas.addEventListener('mousemove',function(e){
    lastX = e.offsetX || (e.pageX - canvas.offsetLeft);
    lastY = e.offsetY || (e.pageY - canvas.offsetTop);
    dragged = true;
    if (dragStart){
      const pt = ctx.transformedPoint(lastX,lastY);
      ctx.translate(pt.x-dragStart.x,pt.y-dragStart.y);
      redraw();
    }
  },false);
  canvas.addEventListener('mouseup',function(e){
    dragStart = null;
  },false);

  const scaleFactor = 1.1;
  const zoom = function(clicks){
    const pt = ctx.transformedPoint(lastX,lastY);
    ctx.translate(pt.x,pt.y);
    const factor = Math.pow(scaleFactor,clicks);
    ctx.scale(factor,factor);
    ctx.translate(-pt.x,-pt.y);
    redraw();
  }

  const handleScroll = function(e){
    const delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
    if (delta) zoom(delta);
    return e.preventDefault() && false;
  };
  canvas.addEventListener('DOMMouseScroll',handleScroll,false);
  canvas.addEventListener('mousewheel',handleScroll,false);
};

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx){
  const svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
  let xform = svg.createSVGMatrix();
  ctx.getTransform = function(){ return xform; };

  const savedTransforms = [];
  const save = ctx.save;
  ctx.save = function(){
    savedTransforms.push(xform.translate(0,0));
    return save.call(ctx);
  };
  const restore = ctx.restore;
  ctx.restore = function(){
    xform = savedTransforms.pop();
    return restore.call(ctx);
  };

  const scale = ctx.scale;
  ctx.scale = function(sx,sy){
    xform = xform.scaleNonUniform(sx,sy);
    return scale.call(ctx,sx,sy);
  };
  const rotate = ctx.rotate;
  ctx.rotate = function(radians){
    xform = xform.rotate(radians*180/Math.PI);
    return rotate.call(ctx,radians);
  };
  const translate = ctx.translate;
  ctx.translate = function(dx,dy){
    xform = xform.translate(dx,dy);
    return translate.call(ctx,dx,dy);
  };
  const transform = ctx.transform;
  ctx.transform = function(a,b,c,d,e,f){
    const m2 = svg.createSVGMatrix();
    m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
    xform = xform.multiply(m2);
    return transform.call(ctx,a,b,c,d,e,f);
  };
  const setTransform = ctx.setTransform;
  ctx.setTransform = function(a,b,c,d,e,f){
    xform.a = a;
    xform.b = b;
    xform.c = c;
    xform.d = d;
    xform.e = e;
    xform.f = f;
    return setTransform.call(ctx,a,b,c,d,e,f);
  };
  const pt  = svg.createSVGPoint();
  ctx.transformedPoint = function(x,y){
    pt.x=x; pt.y=y;
    return pt.matrixTransform(xform.inverse());
  }
}
