/**
 * Created by wjh on 2017/6/27.
 */
"use strict";
var canvas;
var gl;
var points = [];//顶点容器
var colors = [];//颜色容器
var control;
var u_control=[0,0,0];
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
umVertices = 36;//立方体需要12个三角形，共36个顶点

function init(){
    canvas = document.getElementById("cube");
    gl=WebGLUtils.setupWebGL(canvas);
    if(!gl){alert("您的浏览器不支持WebGL!");}

   gl.viewport(0,0,canvas.width,canvas.height);//设置视口大小
    gl.clearColor(0.0,0.0,0.0,1.0);//设置背景颜色
    colorCube();//彩色立方体
    gl.enable(gl.DEPTH_TEST);//消除隐藏面
    //初始化着色器
    var program = initShaders(gl,"v-shader","f-shader");
    gl.useProgram(program);

   //创建缓冲区，并向缓冲区写入立方体每个面的颜色信息
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

   //获取着色器中a_Color变量，并向其传递数据
    var a_Color = gl.getAttribLocation( program, "a_Color" );
    gl.vertexAttribPointer( a_Color, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( a_Color );

   //创建缓冲区，并向缓冲区写入立方体的顶点左边信息
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    //获取着色器中a_Position变量，并向其传递数据
    var a_Position = gl.getAttribLocation(program,"a_Position");
    gl.vertexAttribPointer(a_Position,4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(a_Position);
    //设置正射投影，即盒状空间，获取着色器变量u_Matrix，并传递数据
    var u_Matrix = gl.getUniformLocation(program,"u_Matrix");
    if(!u_Matrix){alert("获取u_Matrix位置失败！")}
    var iMatrix = new Matrix4();
    iMatrix.setOrtho(3,-3,-3,3,5,-5);
    gl.uniformMatrix4fv(u_Matrix,false,iMatrix.elements);
    control = gl.getUniformLocation(program,"u_control");
    
   //添加窗口监听事件，在窗口底下的三个按钮，用于控制立方体绕坐标轴转动
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
   render();//执行绘图函数
}
//彩色立方体的顶点索引
function colorCube()
{
    quad( 1, 0, 3, 2 );//第一个面
    quad( 2, 3, 7, 6 );//第二个面
    quad( 3, 0, 4, 7 );//第三个面
    quad( 6, 5, 1, 2 );//第四个面
    quad( 4, 5, 6, 7 );//第五个面
    quad( 5, 4, 0, 1 );//第六个面
}
function quad(a,b,c,d){
    //立方体的八个顶点(x,y,z,a)
    var vertices=[
        vec4( -1.0, -1.0,  1.0, 1.0 ),
        vec4( -1.0,  1.0,  1.0, 1.0 ),
        vec4(  1.0,  1.0,  1.0, 1.0 ),
        vec4(  1.0, -1.0,  1.0, 1.0 ),
        vec4( -1.0, -1.0, -1.0, 1.0 ),
        vec4( -1.0,  1.0, -1.0, 1.0 ),
        vec4(  1.0,  1.0, -1.0, 1.0 ),
        vec4(  1.0, -1.0, -1.0, 1.0 )
    ];
    //立方体面的颜色信息（r,g,b,a）
    var cubeColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // 黑
        [ 1.0, 0.0, 0.0, 1.0 ],  // 红
        [ 1.0, 1.0, 0.0, 1.0 ],  // 黄
        [ 0.0, 1.0, 0.0, 1.0 ],  // 绿
        [ 0.0, 0.0, 1.0, 1.0 ],  // 蓝
        [ 1.0, 0.0, 1.0, 1.0 ],  // 品红
        [ 0.0, 1.0, 1.0, 1.0 ],  // 青色
        [ 1.0, 1.0, 1.0, 1.0 ]  //白色
    ];
    var indices = [ a, b, c, a, c, d ];//顶点索引顺序
    //存取顶点余顶点索引信息算法
    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //quad(1,0,3,2)按照indice的索引，另points.push(vertices[1],vertices[0],
        // vertices[3],vertices[1],vertices[3],vertices[2]);
        //再执行quad()......,直到六个quad()全执行完
        colors.push(cubeColors[a]);
    }

}
//绘制立方体
function render(){
    //清除缓存和深度清除
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    //控制立方体旋转
    u_control[axis] += 2.0;
    //获取顶点着色器中u_control的位置
    gl.uniform3fv(control, u_control);
    //画立方体
    gl.drawArrays(gl.TRIANGLES,0,NumVertices);
    //循环函数，用于无限执行和渲染动画，让立方体一直转动
    requestAnimationFrame(render);
}
window.onload = init;//窗口加载init函数，使立方体最终显示在屏幕上