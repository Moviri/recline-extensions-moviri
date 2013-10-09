'use strict';
var loadPanels, runCode, minimizePanel, maximizePanel, reducePanelsWidth;
require(['underscore', 'CodeMirror', 'vendor/jshint-2.1.4', '../bower_components/codemirror/addon/fold/foldcode', '../bower_components/codemirror/addon/fold/brace-fold',
        '../bower_components/codemirror/addon/fold/indent-fold', '../bower_components/codemirror/addon/fold/xml-fold',
        '../bower_components/codemirror/addon/edit/closetag', '../bower_components/codemirror/addon/edit/closebrackets.js',
        '../bower_components/codemirror/addon/edit/matchbrackets', '../bower_components/codemirror/mode/javascript/javascript',
        '../bower_components/codemirror/mode/css/css', '../bower_components/codemirror/mode/xml/xml',
        '../bower_components/codemirror/mode/htmlmixed/htmlmixed',
        '../bower_components/codemirror/addon/lint/javascript-lint', '../bower_components/codemirror/addon/lint/json-lint' ], function (_, CodeMirror, JSHINT) {

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        return null;
    }

    var scriptElem = null;

    var foldFuncJS_CSS = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
    var foldFuncHtml = CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);

    var jsCodeMirror = CodeMirror.fromTextArea(document.getElementById('__areaJS'), {
        lineNumbers: true,
        mode: 'javascript',
        gutters: ['CodeMirror-lint-markers'],
        lintWith: CodeMirror.javascriptValidator
// 			indentWithTabs: true,
// 			smartIndent: true,
// 			matchBrackets : true,
// 			autoCloseBrackets: true,
// 			autofocus: true,
// 			lineWrapping: true,
    });
    jsCodeMirror.on('gutterClick', foldFuncJS_CSS);

    var htmlCodeMirror = CodeMirror.fromTextArea(document.getElementById('__areaHtml'), {
        mode: 'text/html',
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets: true,
        autoCloseTags: true,
        autofocus: true,
        lineWrapping: false
    });
    htmlCodeMirror.on('gutterClick', foldFuncHtml);

    var cssCodeMirror = CodeMirror.fromTextArea(document.getElementById('__areaCSS'), {
        mode: 'css',
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        autofocus: true,
        lineWrapping: false
    });
    cssCodeMirror.on('gutterClick', foldFuncJS_CSS);


    loadPanels = function($this, htmlCodename, jsCodename, cssCodename, helpCodename) {
        $('#__tutorial_tree__ a.selected').removeClass('selected'); // deselect all previous tree nodes
        if ($this) {
            $this.addClass('selected'); // select this tree node
            var $parentInput = $this.parent().parent().prev().prev('input');
            if ($parentInput) {
                $parentInput.attr('checked', 'checked'); // also open parent folder
            }
        }
        if (htmlCodename) {
            htmlCodeMirror.setValue(IO('html', htmlCodename));
            enforceCodeFolding(htmlCodeMirror, foldFuncHtml);
        }
        else {
            htmlCodeMirror.setValue('');
        }
        if (jsCodename) {
           jsCodeMirror.setValue(IO('js', jsCodename));
           enforceCodeFolding(jsCodeMirror, foldFuncJS_CSS);
        }
        else {
            jsCodeMirror.setValue('');
        }
        if (cssCodename) {
           cssCodeMirror.setValue(IO('css', cssCodename));
        }
        else {
            cssCodeMirror.setValue('');
        }
        if (helpCodename) {
           $('#__helpDialogContent').html(IO('help', helpCodename));
        }
        else {
            $('#__helpDialogContent').html('');
        }
        $('#__div_result').empty();

        runCurrentCode();
   };


   function assignDividerEvents($elem, $panel1, $panel2, horiz) {
        $elem.data('dragMode', 0);
        //console.log($elem[0].id+ ' DRAGMODE = '+$elem.data('dragMode'))

        $elem.on('mousedown', function () {
            $elem.data('dragMode', 1);
            //console.log($elem[0].id+ ' DRAGMODE = '+$elem.data('dragMode'))
        });

        $(document.body).on('mouseup', function () {
            $elem.data('dragMode', 0);
            //console.log($elem[0].id+ ' DRAGMODE = '+$elem.data('dragMode'))
        });

        $(document.body).on('mousemove', function (event) {
            if ($elem.data('dragMode') === 1) {
                //console.dir(event.originalEvent)
                event.stopPropagation();

                var fixDelta = function(delta) {
                    if (delta > 0 && delta > 20) {
                        delta = 20;
                    }
                    else if (delta < 0 && delta < -20) {
                        delta = -20;
                    }
                    return delta;
                };

                if (horiz) {
                    var deltaY = fixDelta(event.originalEvent.mozMovementY || event.originalEvent.webkitMovementY || event.originalEvent.offsetY - $panel1.height());
                    var topH = $panel1.height() + deltaY;
                    var bottomH = $panel2.height() - deltaY;
                    if (topH > 50 && bottomH > 50) {
                        $panel1.height(topH);
                        $panel2.height(bottomH);
                    }
                }
                else {
                    var deltaX = fixDelta(event.originalEvent.mozMovementX || event.originalEvent.webkitMovementX || event.originalEvent.offsetX - $panel1.width());
                    var leftW = $panel1.width() + deltaX;
                    var rightW = $panel2.width() - deltaX;
                    if (leftW > 50 && rightW > 50) {
                        $panel1.width(leftW);
                        $panel2.width(rightW);
                    }
                }

            }
        });
    }

    assignDividerEvents($('#__horizLeftDivider'), $('#__htmlPanel'), $('#__jsPanel'), true);
    assignDividerEvents($('#__horizRightDivider'), $('#__cssPanel'), $('#__resultPanel'), true);
    assignDividerEvents($('#__verticalDivider'), $('#__leftPanel'), $('#__rightPanel'), false);

    var queryVariable = getQueryVariable('q');
    if (queryVariable) {
        var $treeNode = $('#__tutorial_tree__ a[value$="#' + queryVariable + '"]');
        if ($treeNode.length) {
            $treeNode.click();
        }
    }
    else {
        loadPanels(null, 'demo', 'demo', 'demo', 'demo');
    }

    runCode = function() {
        runCurrentCode();
    };

    function runCurrentCode() {
        var success = JSHINT(jsCodeMirror.getValue(), {asi: true, smarttabs: true, laxbreak: true, laxcomma: true, multistr: true});
        if (!success) {
            //console.dir(JSHINT.errors);
            var errMsg = '';
            _.each(JSHINT.errors, function (err) {
                if (err.code !== 'W070') {
                    errMsg += 'Error at line ' + err.line + ' col ' + err.character + '\n' +
                        'Offending code is:\n' + err.evidence + '\n' +
                        'Reason is: ' + err.reason + '\n' +
                        '_____________________________________\n';
                }
            });
            if (errMsg.length) {
                alert(errMsg);
                return;
            }
        }

        if (scriptElem) {
            try {
                document.body.removeChild(scriptElem);
                //console.log($('#__myRunningCode'));
                //scriptElem = undefined;
            }
            catch (err) {
            }
        }

        $('#__div_result').empty();
        $('#__div_result').append('<style>' + cssCodeMirror.getValue() + '</style> ' + htmlCodeMirror.getValue());

        scriptElem = document.createElement('script');
        scriptElem.id = '__myRunningCode';
        scriptElem.async = 'async';
        scriptElem.defer = 'defer';

        scriptElem.textContent = jsCodeMirror.getValue();
        document.body.appendChild(scriptElem);
    }

    function IO(path, filename) {
        var ext;
        switch (path) {
            case 'css' :
                ext = '.css';
                break;
            case 'help' :
                ext = '.txt';
                break;
            case 'html' :
                ext = '.html';
                break;
            default :
                ext = '.js';
        }
        var pathname = 'tutorial/code/' + path + '/' + filename + ext;
        var X = (!window.XMLHttpRequest ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest());
        X.open('GET', pathname, false);
        X.send('');

        return X.responseText;
    }

    function enforceCodeFolding(codeMirrorObj, foldFunc) {
        var totLines = codeMirrorObj.lineCount();
        for (var r = 0; r < totLines; r++) {
            var lineCode = codeMirrorObj.getLine(r);
            if (lineCode.indexOf('/*FOLD_ME*/') > 0) {
                codeMirrorObj.setLine(r, lineCode.replace('/*FOLD_ME*/', ''));
                foldFunc(codeMirrorObj, r);
            }
        }
    }


    var MIN_HEIGHT = 80;
    var MIN_WIDTH = 200;

    minimizePanel = function(panel1, panel2) {
        var $panel1 = $('#' + panel1);
        var $panel2 = $('#' + panel2);
        var oldH1 = $panel1.height();
        var oldH2 = $panel2.height();

        if (oldH1 > MIN_HEIGHT) {
            var delta = MIN_HEIGHT - oldH1;
            $panel1.height(oldH1 + delta);
            $panel2.height(oldH2 - delta);
        }
    };

    maximizePanel = function(panel1, panel2) {
       var  $panel1 = $('#' + panel1);
        var $panel2 = $('#' + panel2);
        var oldH1 = $panel1.height();
        var oldH2 = $panel2.height();

        if (oldH2 > MIN_HEIGHT) {
            var delta = MIN_HEIGHT - oldH2;
            $panel1.height(oldH1 - delta);
            $panel2.height(oldH2 + delta);
        }
    };

    reducePanelsWidth = function(panel1, panel2) {
       var  $panel1 = $('#' + panel1);
        var $panel2 = $('#' + panel2);
        var oldW1 = $panel1.width();
        var oldW2 = $panel2.width();
        if (oldW1 > MIN_WIDTH) {
            var delta = MIN_WIDTH - oldW1;
            $panel1.width(oldW1 + delta);
            $panel2.width(oldW2 - delta);
        }
    };
});
