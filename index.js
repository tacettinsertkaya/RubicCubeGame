//https://developer.mozilla.org/en-US/demos/detail/rubiks-cube-using-html5/launch
! function() {
    var DIST_DRAG = 30,
        HINT_DELAY = 500,
        ifs = document.querySelectorAll(".scene > .icon > div"),
        icons = document.querySelectorAll(".scene > .icon > div > div"),
        pieces = document.querySelectorAll(".scene > .cube .p"),
        pf1s = document.querySelectorAll(".scene > .cube .f1"),
        pf2s = document.querySelectorAll(".scene > .cube .f2"),
        pf3s = document.querySelectorAll(".scene > .cube .f3"),
        pf4s = document.querySelectorAll(".scene > .cube .f4"),
        pf5s = document.querySelectorAll(".scene > .cube .f5"),
        pf6s = document.querySelectorAll(".scene > .cube .f6"),
        arrows = document.querySelectorAll(".scene > .cube > .pointer .hint > .arrow"),
        rects = document.querySelectorAll(".scene > .cube > .pointer .hint > .rect"),
        scene = document.querySelector(".scene"),
        cube = document.querySelector(".scene > .cube"),
        axis = document.querySelector(".scene > .cube > .axis"),
        pointer = document.querySelector(".scene > .cube > .pointer"),
        px = document.querySelector(".scene > .cube > .pointer > .x"),
        py = document.querySelector(".scene > .cube > .pointer > .y"),
        pz = document.querySelector(".scene > .cube > .pointer > .z"),
        hint = document.querySelector(".scene > .cube > .pointer .hint"),
        row1 = [
            [pf1s[0], pf1s[1], pf1s[2]],
            [pf2s[0], pf2s[1], pf2s[2]],
            [pf3s[0], pf3s[1], pf3s[2]],
            [pf4s[0], pf4s[1], pf4s[2]]
        ],
        row2 = [
            [pf1s[3], pf1s[4], pf1s[5]],
            [pf2s[3], pf2s[4], pf2s[5]],
            [pf3s[3], pf3s[4], pf3s[5]],
            [pf4s[3], pf4s[4], pf4s[5]]
        ],
        row3 = [
            [pf1s[6], pf1s[7], pf1s[8]],
            [pf2s[6], pf2s[7], pf2s[8]],
            [pf3s[6], pf3s[7], pf3s[8]],
            [pf4s[6], pf4s[7], pf4s[8]]
        ],
        row4 = [
            [pf1s[0], pf1s[3], pf1s[6]], // 下面的立方体比较好画，但和程序中的立方体位置不一样
            [pf6s[0], pf6s[3], pf6s[6]], // 上边的面是 f5，左边是 f2，右边是 f1
            [pf3s[8], pf3s[5], pf3s[2]], //        ______ x
            [pf5s[0], pf5s[3], pf5s[6]] //      /\          _  _  _
        ],
        row5 = [ //     /  \       /\ _\ _\ _\
            [pf1s[1], pf1s[4], pf1s[7]], //    /    \     /\/\ _\ _\ _\
            [pf6s[1], pf6s[4], pf6s[7]], //   y      z   /\/\/\ _\ _\ _\
            [pf3s[7], pf3s[4], pf3s[1]], //              \/\/\/_ /_ /_ / <- row 1
            [pf5s[1], pf5s[4], pf5s[7]] //             / \/\/_ /_ /_ / <- row 2
        ],
        row6 = [ //        row 7 / \/_ /_ /_ / <- row 3
            [pf1s[2], pf1s[5], pf1s[8]], //         row 8 /  ^  ^  ^
            [pf6s[2], pf6s[5], pf6s[8]], //          row 9   |  | row 6
            [pf3s[6], pf3s[3], pf3s[0]], //                  | row 5
            [pf5s[2], pf5s[5], pf5s[8]] //                 row 4
        ],
        row7 = [
            [pf2s[0], pf2s[3], pf2s[6]],
            [pf6s[6], pf6s[7], pf6s[8]],
            [pf4s[8], pf4s[5], pf4s[2]],
            [pf5s[2], pf5s[1], pf5s[0]]
        ],
        row8 = [
            [pf2s[1], pf2s[4], pf2s[7]],
            [pf6s[3], pf6s[4], pf6s[5]],
            [pf4s[7], pf4s[4], pf4s[1]],
            [pf5s[5], pf5s[4], pf5s[3]]
        ],
        row9 = [
            [pf2s[2], pf2s[5], pf2s[8]],
            [pf6s[0], pf6s[1], pf6s[2]],
            [pf4s[6], pf4s[3], pf4s[0]],
            [pf5s[8], pf5s[7], pf5s[6]]
        ],
        roll = { on: false, dragging: false }, // 后面还会添加属性
        timerHint = 0,
        i, j, len, n, s;

    readColor();
    listen();

    // 把 div 的颜色保存到对应 dom 元素的自定义属性 xxc
    function readColor() {
        // 知道 icons 和 pieces 长度一样
        // 它们的颜色也应该一样，尽管如此，还是读取各自的类
        for (i = 0, len = icons.length; i < len; ++i) {
            n = icons[i].className.indexOf("c");
            s = icons[i].className.substr(n, 2);
            icons[i].xxc = s;

            n = pieces[i].className.indexOf("c");
            s = pieces[i].className.substr(n, 2);
            pieces[i].xxc = s;
        }
    }

    function listen() {
        axis.addEventListener("transition" in document.body.style ? "transitionend" : "webkitTransitionEnd", onTransitionEnd);
        pointer.addEventListener("wheel", onWheel);
        pointer.addEventListener("mousedown", onMouseDown);
        scene.addEventListener("mousemove", onMouseMove);
        scene.addEventListener("mouseup", onMouseUp);
        scene.addEventListener("mouseleave", onMouseLeave);
    }

    // 把立方体 6 个面的颜色同步到图标
    function synchronize() {
        var ci, cp, lead, follows;

        for (i = 0; i < 54; i += 9) {
            lead = pieces[i].xxc;
            follows = 0;

            for (j = 0; j < 9; ++j) {
                n = i + j;
                ci = icons[n].xxc;
                cp = pieces[n].xxc;
                icons[n].classList.toggle(ci);
                icons[n].classList.toggle(cp);
                icons[n].xxc = cp;
                cp == lead && ++follows;
            }

            follows == 9 ? ifs[i / 9].classList.add("fused") : ifs[i / 9].classList.remove("fused");
        }
    }

    // ctrl + 滑轮是缩放文档，所以按 ctrl 时不转
    function onWheel(e) {
        var wheelDelta = e.wheelDelta || -e.deltaY;

        if (!e.ctrlKey) {
            e.preventDefault(); // 阻止屏幕滚动

            if (!roll.on) {
                if (e.target.className == "x") {
                    roll.str = wheelDelta > 0 ? 90 : -90;
                    playAnimation(row4, row5, row6, pf4s, pf2s);
                } else if (e.target.className == "y") {
                    roll.str = wheelDelta > 0 ? -90 : 90;
                    playAnimation(row1, row2, row3, pf6s, pf5s);
                } else if (e.target.className == "z") {
                    // wheelDelta > 0 时向上转，沿 z 轴顺时针，f1 顺时针，f3 逆时针
                    roll.str = wheelDelta > 0 ? 90 : -90;
                    playAnimation(row7, row8, row9, pf1s, pf3s);
                }
            }
        }
    }

    function onTransitionEnd(e) {
        axis.style.transition = "none";
        axis.style.transform = "";
        reassignColor();
        synchronize();
        setTimeout(resetAxis, 0);

        function resetAxis() {
            roll.on = false;
            axis.style.transition = "";
        }
    }

    function onMouseDown(e) {
        var p;

        if (!roll.on) {
            e.preventDefault(); // 拖动时不要改变鼠标形状
            pointer.style.display = "none";
            p = document.elementFromPoint(e.clientX, e.clientY);
            pointer.style.display = "";

            if (p && p.classList.contains("p")) {
                roll.dragging = true;
                roll.x = e.clientX;
                roll.y = e.clientY;
                roll.f = getFace(p); // face 用来确定要转动的面
                roll.p = getPiece(p); // piece 配合角度确定力度
            }
        }
    }

    // mousemove 的时候，e.button 不能告诉左键是否按下，而 chrome 41 又不支持 e.buttons
    function onMouseMove(e) {
        var angle, dir;

        if (roll.dragging) {
            // 如果鼠标当前位置离 mouse down 时的移动较大，认为是指定方向，在这里计算方向，刷新图示
            // 计算距离的办法为 |dx| > 常量或者 |dy| > 常量，而不使用两点间距离公式

            if (Math.abs(roll.y - e.clientY) > DIST_DRAG || Math.abs(roll.x - e.clientX) > DIST_DRAG) {
                angle = getAngle(e.clientX, e.clientY);
                dir = getDir(roll.f, angle);
                roll.dir = dir;
                roll.str = getStr(roll.p, dir);
                showHint();
            } else
                hideHint();
        }
    }

    function getFace(p) {
        n = p.className.indexOf("f");
        return +p.className.substr(n + 1, 1);
    }

    function getPiece(p) {
        n = p.className.indexOf("p", 1); // 跳过第一个 p
        return +p.className.substr(n + 1, 1);
    }

    // 以 (roll.x, roll.y) 做起点，(x, y) 做终点
    // atan2 能处理分母 dx = 0 的情况
    function getAngle(x, y) {
        // getAngle 用 atan2 计算，atan2 的坐标系是
        //
        //              90deg
        //              ^ y
        //       x      |
        // 0deg  <------|------- 180deg
        //              |
        //             -90deg

        return Math.round(Math.atan2(roll.y - y, roll.x - x) * 180 / Math.PI);
    }

    function getDir(f, angle) {
        // 三个面上什么角度对应什么方向，通过在纸上画图得出
        // 这里规定 up = 1, r = right = 2, dn = down = 3, l = left = 4

        if (f == 1) {
            //  r = 2    dn = 3     l = 4     up = 1    r = 2
            // ------- | ------- | ------- | ------- | -------
            //       -150       -60        30       120

            if (angle < -150) return 2;
            else if (angle < -60) return 3;
            else if (angle < 30) return 4;
            else if (angle < 120) return 1;
            else return 2;
        } else if (f == 2) {
            //  r = 2    dn = 3     l = 4     up = 1    r = 2
            // ------- | ------- | ------- | ------- | -------
            //       -120       -30        60       150

            if (angle < -120) return 2;
            else if (angle < -30) return 3;
            else if (angle < 60) return 4;
            else if (angle < 150) return 1;
            else return 2;
        } else if (f == 5) {
            // 认为左上是上
            //  dn = 3    l = 4     up = 1     r = 2
            // ------- | ------- | ------- | ------- |
            //        -90        0        90        180

            if (angle < -90) return 3;
            else if (angle < 0) return 4;
            else if (angle < 90) return 1;
            else return 2;
        } else
            return 0;
    }

    function getStr(p, dir) {
        if (dir == 1) { // up
            if (p == 7 || p == 8 || p == 9) return 270;
            else if (p == 4 || p == 5 || p == 6) return 180;
            else return 90;
        } else if (dir == 2) { // right
            if (p == 1 || p == 4 || p == 7) return 270;
            else if (p == 2 || p == 5 || p == 8) return 180;
            else return 90;
        } else if (dir == 3) { // down
            if (p == 1 || p == 2 || p == 3) return -270;
            else if (p == 4 || p == 5 || p == 6) return -180;
            else return -90;
        } else if (dir == 4) { // left
            if (p == 3 || p == 6 || p == 9) return -270;
            else if (p == 2 || p == 5 || p == 8) return -180;
            else return -90;
        } else
            return 0;
    }

    // 确认拖动，隐藏提示
    function onMouseUp(e) {
        var f, p, dir;

        if (roll.dragging) {
            roll.dragging = false;

            if (Math.abs(roll.y - e.clientY) > DIST_DRAG || Math.abs(roll.x - e.clientX) > DIST_DRAG) {
                f = roll.f;
                p = roll.p;
                dir = roll.dir;
                hideHint();

                if (Math.abs(roll.str) == 180)
                    axis.style.transitionDuration = "0.5s";
                else if (Math.abs(roll.str) == 270)
                    axis.style.transitionDuration = "0.6s";

                // up = 1, right = 2, down = 3, left = 4
                // 发生在 f1 上的 roll 只能是 row 1, 2, 3, 4, 5, 6 之一
                // 发生在 f2 上的 roll 只能是 row 1, 2, 3, 7, 8, 9 之一
                // 发生在 f5 上的 roll 只能是 row 4, 5, 6, 7, 8, 9 之一
                if (f == 1) {
                    if (dir == 1 || dir == 3) { // 上下
                        if (p == 1 || p == 4 || p == 7) playAnimation(row4, 0, 0, 0, pf2s);
                        else if (p == 2 || p == 5 || p == 8) playAnimation(row5);
                        else if (p == 3 || p == 6 || p == 9) playAnimation(row6, 0, 0, pf4s);
                    } else { // 左右
                        if (p == 1 || p == 2 || p == 3) playAnimation(row1, 0, 0, 0, pf5s);
                        else if (p == 4 || p == 5 || p == 6) playAnimation(row2);
                        else if (p == 7 || p == 8 || p == 9) playAnimation(row3, 0, 0, pf6s);
                    }
                } else if (f == 2) {
                    if (dir == 1 || dir == 3) { // 上下
                        if (p == 1 || p == 4 || p == 7) playAnimation(row7, 0, 0, 0, pf3s);
                        else if (p == 2 || p == 5 || p == 8) playAnimation(row8);
                        else if (p == 3 || p == 6 || p == 9) playAnimation(row9, 0, 0, pf1s);
                    } else { // 和 f == 1 的左右一样
                        if (p == 1 || p == 2 || p == 3) playAnimation(row1, 0, 0, 0, pf5s);
                        else if (p == 4 || p == 5 || p == 6) playAnimation(row2);
                        else if (p == 7 || p == 8 || p == 9) playAnimation(row3, 0, 0, pf6s);
                    }
                } else if (f == 5) {
                    if (dir == 1 || dir == 3) { // 和 f == 1 的上下一样
                        if (p == 1 || p == 4 || p == 7) playAnimation(row4, 0, 0, 0, pf2s);
                        else if (p == 2 || p == 5 || p == 8) playAnimation(row5);
                        else if (p == 3 || p == 6 || p == 9) playAnimation(row6, 0, 0, pf4s);
                    } else { // f == 2 的上下对应这里的左右
                        if (p == 1 || p == 2 || p == 3) playAnimation(row7, 0, 0, 0, pf3s);
                        else if (p == 4 || p == 5 || p == 6) playAnimation(row8);
                        else if (p == 7 || p == 8 || p == 9) playAnimation(row9, 0, 0, pf1s);
                    }
                }
            }
        }
    }

    // 取消拖动，隐藏提示
    function onMouseLeave(e) {
        roll.dragging = false;
        hideHint();
    }

    // f2 和前面三行一面的转动方向相反
    // 因为有全局变量（闭包变量）row1、row2、row3，函数又要使用这些全局变量，所以参数为 r1、r2、r3
    function playAnimation(r1, r2, r3, f1, f2) {
        var row = r1 || r2 || r3,
            face = f1 || f2; // 两个 face 都可能是空

        roll.row1 = r1;
        roll.row2 = r2;
        roll.row3 = r3;
        roll.face1 = f1;
        roll.face2 = f2;

        // 转动 1 个以上的列就是整体旋转，也可以判断 f1 && f2，等等
        if (r1 && r2)
            for (i = 0, len = pieces.length; i < len; ++i)
                axis.appendChild(pieces[i]);
        else {
            for (i = 0; i < 4; ++i)
                for (j = 0; j < 3; ++j)
                    axis.appendChild(row[i][j]);

            if (face)
                for (i = 0, len = face.length; i < len; ++i)
                    axis.appendChild(face[i]);
        }

        if (row == row1 || row == row2 || row == row3) s = "rotateY(";
        else if (row == row4 || row == row5 || row == row6) s = "rotateX(";
        else s = "rotateZ(";

        roll.on = true;
        axis.style.transform = s + roll.str + "deg)";
    }

    function reassignColor() {
        var row1 = roll.row1,
            row2 = roll.row2,
            row3 = roll.row3,
            face1 = roll.face1,
            face2 = roll.face2,
            str = roll.str,
            row, face;

        if (row1 && row2) {
            rollRow(row1, str);
            rollRow(row2, str);
            rollRow(row3, str);
            rollFace(face1, str);
            rollFace(face2, -str);

            for (i = 0, len = pieces.length; i < len; ++i)
                cube.appendChild(pieces[i]);
        } else {
            row = row1 || row2 || row3;
            face = face1 || face2;

            for (i = 0; i < 4; ++i)
                for (j = 0; j < 3; ++j)
                    cube.appendChild(row[i][j]);

            rollRow(row, str);

            if (face) {
                for (i = 0, len = face.length; i < len; ++i)
                    cube.appendChild(face[i]);

                rollFace(face, roll.face1 ? str : -str);
            }
        }
    }

    function rollFace(f, str) {
        var t0, t1, t2, c0, c1, c2;

        if (str == 180 || str == -180) {
            t0 = f[0].xxc;
            t1 = f[1].xxc;
            t2 = f[2].xxc;
            c0 = f[8].xxc;
            c1 = f[7].xxc;
            c2 = f[6].xxc;
            f[0].classList.remove(t0);
            f[1].classList.remove(t1);
            f[2].classList.remove(t2);
            f[8].classList.remove(c0);
            f[7].classList.remove(c1);
            f[6].classList.remove(c2);
            f[0].classList.add(c0);
            f[1].classList.add(c1);
            f[2].classList.add(c2);
            f[8].classList.add(t0);
            f[7].classList.add(t1);
            f[6].classList.add(t2);
            f[0].xxc = c0;
            f[1].xxc = c1;
            f[2].xxc = c2;
            f[8].xxc = t0;
            f[7].xxc = t1;
            f[6].xxc = t2;

            t0 = f[3].xxc;
            c0 = f[5].xxc;
            f[3].classList.remove(t0);
            f[3].classList.add(c0);
            f[5].classList.remove(c0);
            f[5].classList.add(t0);
            f[3].xxc = c0;
            f[5].xxc = t0;
        } else if (str == 90 || str == -270) {
            t0 = f[0].xxc;
            t1 = f[1].xxc;
            f[0].classList.remove(t0);
            f[1].classList.remove(t1);

            c0 = f[6].xxc;
            c1 = f[3].xxc;
            f[6].classList.remove(c0);
            f[3].classList.remove(c1);
            f[0].classList.add(c0);
            f[1].classList.add(c1);
            f[0].xxc = c0;
            f[1].xxc = c1;

            c0 = f[8].xxc;
            c1 = f[7].xxc;
            f[8].classList.remove(c0);
            f[7].classList.remove(c1);
            f[6].classList.add(c0);
            f[3].classList.add(c1);
            f[6].xxc = c0;
            f[3].xxc = c1;

            c0 = f[2].xxc;
            c1 = f[5].xxc;
            f[2].classList.remove(c0);
            f[5].classList.remove(c1);
            f[8].classList.add(c0);
            f[7].classList.add(c1);
            f[8].xxc = c0;
            f[7].xxc = c1;

            f[2].classList.add(t0);
            f[5].classList.add(t1);
            f[2].xxc = t0;
            f[5].xxc = t1;
        } else if (str == -90 || str == 270) {
            t0 = f[0].xxc;
            t1 = f[1].xxc;
            f[0].classList.remove(t0);
            f[1].classList.remove(t1);

            c0 = f[2].xxc;
            c1 = f[5].xxc;
            f[2].classList.remove(c0);
            f[5].classList.remove(c1);
            f[0].classList.add(c0);
            f[1].classList.add(c1);
            f[0].xxc = c0;
            f[1].xxc = c1;

            c0 = f[8].xxc;
            c1 = f[7].xxc;
            f[8].classList.remove(c0);
            f[7].classList.remove(c1);
            f[2].classList.add(c0);
            f[5].classList.add(c1);
            f[2].xxc = c0;
            f[5].xxc = c1;

            c0 = f[6].xxc;
            c1 = f[3].xxc;
            f[6].classList.remove(c0);
            f[3].classList.remove(c1);
            f[8].classList.add(c0);
            f[7].classList.add(c1);
            f[8].xxc = c0;
            f[7].xxc = c1;

            f[6].classList.add(t0);
            f[3].classList.add(t1);
            f[6].xxc = t0;
            f[3].xxc = t1;
        }
    }

    // row = [[p1, p2, p3], ...], row.length = 4
    function rollRow(row, str) {
        var p0, p1, p2, p3, p4, p5,
            c0, c1, c2, c3, c4, c5;

        if (str == 90 || str == -270) {
            p0 = row[0][0];
            p1 = row[0][1];
            p2 = row[0][2];
            c0 = p0.xxc;
            c1 = p1.xxc;
            c2 = p2.xxc;
            p0.classList.toggle(c0);
            p1.classList.toggle(c1);
            p2.classList.toggle(c2);

            p3 = row[1][0];
            p4 = row[1][1];
            p5 = row[1][2];
            change();

            p0 = p3;
            p1 = p4;
            p2 = p5;
            p3 = row[2][0];
            p4 = row[2][1];
            p5 = row[2][2];
            change();

            p0 = p3;
            p1 = p4;
            p2 = p5;
            p3 = row[3][0];
            p4 = row[3][1];
            p5 = row[3][2];
            change();

            p3.classList.toggle(c0);
            p4.classList.toggle(c1);
            p5.classList.toggle(c2);
            p3.xxc = c0;
            p4.xxc = c1;
            p5.xxc = c2;

        } else if (str == 180 || str == -180) {
            p0 = row[0][0];
            p1 = row[0][1];
            p2 = row[0][2];
            p3 = row[2][0];
            p4 = row[2][1];
            p5 = row[2][2];
            swap();

            p0 = row[1][0];
            p1 = row[1][1];
            p2 = row[1][2];
            p3 = row[3][0];
            p4 = row[3][1];
            p5 = row[3][2];
            swap();

        } else if (str == -90 || str == 270) {
            p0 = row[0][0];
            p1 = row[0][1];
            p2 = row[0][2];
            c0 = p0.xxc;
            c1 = p1.xxc;
            c2 = p2.xxc;
            p0.classList.toggle(c0);
            p1.classList.toggle(c1);
            p2.classList.toggle(c2);

            p3 = row[3][0];
            p4 = row[3][1];
            p5 = row[3][2];
            change();

            p0 = p3;
            p1 = p4;
            p2 = p5;
            p3 = row[2][0];
            p4 = row[2][1];
            p5 = row[2][2];
            change();

            p0 = p3;
            p1 = p4;
            p2 = p5;
            p3 = row[1][0];
            p4 = row[1][1];
            p5 = row[1][2];
            change();

            p3.classList.toggle(c0);
            p4.classList.toggle(c1);
            p5.classList.toggle(c2);
            p3.xxc = c0;
            p4.xxc = c1;
            p5.xxc = c2;
        }

        function change() {
            c3 = p3.xxc;
            c4 = p4.xxc;
            c5 = p5.xxc;
            p0.classList.toggle(c3);
            p1.classList.toggle(c4);
            p2.classList.toggle(c5);
            p0.xxc = c3;
            p1.xxc = c4;
            p2.xxc = c5;
            p3.classList.toggle(c3);
            p4.classList.toggle(c4);
            p5.classList.toggle(c5);
        }

        function swap() {
            c0 = p0.xxc;
            c1 = p1.xxc;
            c2 = p2.xxc;
            c3 = p3.xxc;
            c4 = p4.xxc;
            c5 = p5.xxc;
            p0.classList.toggle(c0);
            p1.classList.toggle(c1);
            p2.classList.toggle(c2);
            p3.classList.toggle(c3);
            p4.classList.toggle(c4);
            p5.classList.toggle(c5);
            p0.classList.toggle(c3);
            p1.classList.toggle(c4);
            p2.classList.toggle(c5);
            p3.classList.toggle(c0);
            p4.classList.toggle(c1);
            p5.classList.toggle(c2);
            p0.xxc = c3;
            p1.xxc = c4;
            p2.xxc = c5;
            p3.xxc = c0;
            p4.xxc = c1;
            p5.xxc = c2;
        }
    }

    function showHint() {
        if (hint.style.visibility)
            set();
        else if (timerHint == 0)
            timerHint = setTimeout(show, HINT_DELAY);

        function show() {
            if (roll.f == 1) px.appendChild(hint);
            else if (roll.f == 2) pz.appendChild(hint);
            else if (roll.f == 5) py.appendChild(hint);

            timerHint = 0;
            hint.style.visibility = "visible";
            setTimeout(set, 0);
        }

        function set() {
            setHintDir(roll.dir, Math.abs(roll.str) / 90);
        }
    }

    function hideHint() {
        if (timerHint) {
            clearTimeout(timerHint);
            timerHint = 0;
        }

        if (hint.style.visibility) {
            hint.style.visibility = "";
            setHintDir(0, 0);
        }
    }

    function setHintDir(dir, str) {
        // up = 1, right = 2, down = 3, left = 4

        for (i = 0; i < 4; ++i) arrows[i].classList.remove("active");
        for (i = 0; i < 3; ++i) rects[i].classList.remove("active");

        if (dir == 1) arrows[3].classList.add("active");
        else if (dir == 2) arrows[0].classList.add("active");
        else if (dir == 3) arrows[1].classList.add("active");
        else if (dir == 4) arrows[2].classList.add("active");

        for (i = 0, str = Math.min(str, 3); i < str; ++i)
            rects[i].classList.add("active");
    }
}();