/*global define */

    'use strict';
  var __loadPanels;
   require(['underscore', 'vendor/jshint-2.1.4'], function (_) {


        function __getQueryVariable(variable) {
            var query = window.location.search.substring(1);
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) == variable) {
                    return decodeURIComponent(pair[1]);
                }
            }
            return null;
        }

        var __scriptElem = null;
        var __cssElem = null;

        var __foldFuncJS_CSS = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
        var __foldFuncHtml = CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);

        var __jsCodeMirror = CodeMirror.fromTextArea(document.getElementById('__areaJS'), {
            lineNumbers: true,
            mode: "javascript",
            gutters: ["CodeMirror-lint-markers"],
            lintWith: CodeMirror.javascriptValidator
// 			indentWithTabs: true,
// 			smartIndent: true,
// 			matchBrackets : true,
// 			autoCloseBrackets: true,
// 			autofocus: true,
// 			lineWrapping: true,
        });
        __jsCodeMirror.on("gutterClick", __foldFuncJS_CSS);

        var __htmlCodeMirror = CodeMirror.fromTextArea(document.getElementById('__areaHtml'), {
            mode: 'text/html',
            indentWithTabs: true,
            smartIndent: true,
            lineNumbers: true,
            matchBrackets: true,
            autoCloseTags: true,
            autofocus: true,
            lineWrapping: false
        });
        __htmlCodeMirror.on("gutterClick", __foldFuncHtml);

        var __cssCodeMirror = CodeMirror.fromTextArea(document.getElementById('__areaCSS'), {
            mode: 'css',
            indentWithTabs: true,
            smartIndent: true,
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            autofocus: true,
            lineWrapping: false
        });
        __cssCodeMirror.on("gutterClick", __foldFuncJS_CSS);


       __loadPanels = function($this, htmlCodename, jsCodename, cssCodename, helpCodename) {
           $("#__tutorial_tree__ a.selected").removeClass("selected") // deselect all previous tree nodes
           if ($this) {
               $this.addClass("selected") // select this tree node
               var $parentInput = $this.parent().parent().prev().prev("input");
               if ($parentInput)
                   $parentInput.attr("checked", "checked") // also open parent folder
           }
           if (htmlCodename) {
               __htmlCodeMirror.setValue(__IO("html", htmlCodename))
               __enforceCodeFolding(__htmlCodeMirror, __foldFuncHtml)
           }
           else __htmlCodeMirror.setValue("")

           if (jsCodename) {
               __jsCodeMirror.setValue(__IO("js", jsCodename))
               __enforceCodeFolding(__jsCodeMirror, __foldFuncJS_CSS)
           }
           else __jsCodeMirror.setValue("")

           if (cssCodename)
               __cssCodeMirror.setValue(__IO("css", cssCodename))
           else __cssCodeMirror.setValue("")

           if (helpCodename)
               $("#__helpDialogContent").html(__IO("help", helpCodename))
           else $("#__helpDialogContent").html("")

           $("#__div_result").empty()

           __runCode();
       }


       function __assignDividerEvents($elem, $panel1, $panel2, horiz) {
            $elem.data('dragMode', 0)
            //console.log($elem[0].id+ " DRAGMODE = "+$elem.data('dragMode'))

            $elem.on('mousedown', function (event) {
                $elem.data('dragMode', 1)
                //console.log($elem[0].id+ " DRAGMODE = "+$elem.data('dragMode'))
            });

            $(document.body).on('mouseup', function (event) {
                $elem.data('dragMode', 0)
                //console.log($elem[0].id+ " DRAGMODE = "+$elem.data('dragMode'))
            });

            $(document.body).on('mousemove', function (event) {
                if ($elem.data('dragMode') == 1) {
                    //console.dir(event.originalEvent)
                    event.stopPropagation();

                    var fixDelta = function(delta) {
                        if (delta > 0 && delta > 20)
                            delta = 20
                        else if (delta < 0 && delta < -20)
                            delta = -20;

                        return delta;
                    }

                    if (horiz) {
                        var deltaY = fixDelta(event.originalEvent.mozMovementY || event.originalEvent.webkitMovementY || event.originalEvent.offsetY - $panel1.height())
                        var topH = $panel1.height() + deltaY
                        var bottomH = $panel2.height() - deltaY
                        if (topH > 50 && bottomH > 50) {
                            $panel1.height(topH)
                            $panel2.height(bottomH)
                        }
                    }
                    else {
                        var deltaX = fixDelta(event.originalEvent.mozMovementX || event.originalEvent.webkitMovementX || event.originalEvent.offsetX - $panel1.width())
                        var leftW = $panel1.width() + deltaX
                        var rightW = $panel2.width() - deltaX
                        if (leftW > 50 && rightW > 50) {
                            $panel1.width(leftW)
                            $panel2.width(rightW)
                        }
                    }

                }
            });
        }

        __assignDividerEvents($('#__horizLeftDivider'), $('#__htmlPanel'), $('#__jsPanel'), true)
        __assignDividerEvents($('#__horizRightDivider'), $('#__cssPanel'), $('#__resultPanel'), true)
        __assignDividerEvents($('#__verticalDivider'), $('#__leftPanel'), $('#__rightPanel'), false)

        var __queryVariable = __getQueryVariable('q');
        if (__queryVariable) {
            var $treeNode = $('#__tutorial_tree__ a[value$="#' + __queryVariable + '"]')
            if ($treeNode.length)
                $treeNode.click();
        }
        else
            __loadPanels(null, "demo", "demo", "demo", "demo")

        function __runCode() {
            var success = JSHINT(__jsCodeMirror.getValue(), {asi: true, smarttabs: true, laxbreak: true, laxcomma: true, multistr: true});
            if (!success) {
                //console.dir(JSHINT.errors);
                var errMsg = "";
                _.each(JSHINT.errors, function (err) {
                    if (err.code != "W070")
                        errMsg += "Error at line " + err.line + " col " + err.character + "\n"
                            + "Offending code is:\n" + err.evidence + "\n"
                            + "Reason is: " + err.reason + "\n"
                            + "_____________________________________\n"
                })
                if (errMsg.length) {
                    alert(errMsg);
                    return;
                }
            }

            if (__scriptElem) {
                try {
                    document.body.removeChild(__scriptElem)
                    //console.log($("#__myRunningCode"))
                    //__scriptElem = undefined
                }
                catch (__err) {
                }
            }

            $("#__div_result").empty()
            $("#__div_result").append("<style>" + __cssCodeMirror.getValue() + "</style> " + __htmlCodeMirror.getValue())

            __scriptElem = document.createElement('script');
            __scriptElem.id = "__myRunningCode"
            __scriptElem.async = "async"
            __scriptElem.defer = "defer"
//  			try {
//  				eval(__jsCodeMirror.getValue())
//  			}
//  			catch(__err1)
//  			{
//  				alert(__err1)
//  				return
//  			}

            __scriptElem.textContent = __jsCodeMirror.getValue()
            document.body.appendChild(__scriptElem);
        }

        function __IO(path, filename) {
            var ext;
            switch (path) {
                case "css" :
                    ext = ".css";
                    break;
                case "help" :
                    ext = ".txt";
                    break;
                case "html" :
                    ext = ".html";
                    break;
                default :
                    ext = ".js";
            }
            var pathname = "tutorial/code/" + path + "/" + filename + ext
            var X = !window.XMLHttpRequest ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest;
            X.open("GET", pathname, false);
            X.send("");

            return X.responseText;
        }

        function __enforceCodeFolding(codeMirrorObj, foldFunc) {
            var totLines = codeMirrorObj.lineCount();
            for (var r = 0; r < totLines; r++) {
                var lineCode = codeMirrorObj.getLine(r);
                if (lineCode.indexOf("/*FOLD_ME*/") > 0) {
                    codeMirrorObj.setLine(r, lineCode.replace("/*FOLD_ME*/", ""))
                    foldFunc(codeMirrorObj, r);
                }
            }
        }


        var __MIN_HEIGHT = 80;
        var __MIN_WIDTH = 200;

        function __minimizePanel(panel1, panel2) {
            var $panel1 = $("#" + panel1)
            var $panel2 = $("#" + panel2)
            var oldH1 = $panel1.height()
            var oldH2 = $panel2.height()

            if (oldH1 > __MIN_HEIGHT) {
                var delta = __MIN_HEIGHT - oldH1
                $panel1.height(oldH1 + delta)
                $panel2.height(oldH2 - delta)
            }
        }

        function __maximizePanel(panel1, panel2) {
           var  $panel1 = $("#" + panel1)
            var $panel2 = $("#" + panel2)
            var oldH1 = $panel1.height()
            var oldH2 = $panel2.height()

            if (oldH2 > __MIN_HEIGHT) {
                var delta = __MIN_HEIGHT - oldH2
                $panel1.height(oldH1 - delta)
                $panel2.height(oldH2 + delta)
            }
        }

        function __reducePanelsWidth(panel1, panel2) {
           var  $panel1 = $("#" + panel1)
            var $panel2 = $("#" + panel2)
            var oldW1 = $panel1.width()
            var oldW2 = $panel2.width()
            if (oldW1 > __MIN_WIDTH) {
                var delta = __MIN_WIDTH - oldW1
                $panel1.width(oldW1 + delta)
                $panel2.width(oldW2 - delta)
            }
        }
        return "ciccio";
    });


