import {
    ast,
    Session,
    type Config,
    type ParserBuildOptions,
    type Pass,
    type Plugin,
} from "peggy";
import { SourceNode } from "source-map-generator";

export default {
    use(config: Config, options: ParserBuildOptions): void {
        const x = new Peggyau3(config, options);
        const generate = x.generate.bind(x);

        //options.output = "source";
        config.passes.generate.push(generate);
    }
} satisfies Plugin;


interface IPeggyau3 {
    generate: Pass
}

class Peggyau3 implements IPeggyau3 {
    protected config: Config;
    protected options: ParserBuildOptions;
    protected uniqueId = Date.now().toString(32);
    protected counter: number = 0;
    protected parts: string[] = [];

    constructor(config: Config, options: ParserBuildOptions) {
        this.config = config;
        this.options = options;
    }

    functionName(name: string): string {
        return `__${this.uniqueId}_${name}`;
    }

    toAu3String(value: string): string {
        if (value === "\n") {return "@LF";}
        return `"${value.replace(/"/g, '""').replace(/\r/g, '"&@CR&"').replace(/\n/g, '"&@LF&"')}"`;
    }

    generate(ast: ast.Grammar, options: ParserBuildOptions, session: Session): void {
        const uniqueId = Date.now().toString(16);
        this.parts = [];
        if (options.trace) {
            this.parts.push(`ConsoleWrite("Parser loaded")`);
        }

        // InputStream functions
        this.parts.push([
            `Func ${this.functionName("InputStream")}($sInput)`,
                `Local $t = DllStructCreate("WCHAR input["&StringLen($sInput)&"];LONG length;LONG pos;BOOL eof;")`,
                `DllStructSetData($t, "input", $sInput)`,
                `$t.length = StringLen($sInput)`,
                `$t.pos = 1`,
                `Return $t`,
            `EndFunc`,

            `Func ${this.functionName("InputStream_Peek")}($t)`,
                `If $t.eof Then Return Null`,
                `Return DllStructGetData($t, "input", $t.pos)`,
            `EndFunc`,

            `Func ${this.functionName("InputStream_PeekAhead")}($t, $i)`,
                `If $t.pos + $i > $t.length Then $i = $t.length - $t.pos + 1`,
                `If $i = 0 Then Return Null`,
                // ; Position minus 1, because we are going from 1 based to 0 based index
                // ; Position times 2, because we are dealing with a WCHAR array
                `Return DllStructGetData(DllStructCreate("WCHAR["&$i&"]", DllStructGetPtr($t, "input") + ($t.pos - 1) * 2), 1)`,
            `EndFunc`,

            `Func ${this.functionName("InputStream_Skip")}($t, $i = 1)`,
                `$t.pos += $i`,
                `${this.functionName("InputStream_CheckEOF")}($t)`,
            `EndFunc`,

            `Func ${this.functionName("InputStream_SkipBackwards")}($t, $i = 1)`,
                `${this.functionName("InputStream_Skip")}($t, -$i)`,
            `EndFunc`,

            `Func ${this.functionName("InputStream_Consume")}($t)`,
                `If $t.eof Then Return Null`,
                `Local $c = DllStructGetData($t, "input", $t.pos)`,
                `${this.functionName("InputStream_Skip")}($t)`,
                `Return $c`,
            `EndFunc`,

            `Func ${this.functionName("InputStream_GetPosition")}($t)`,
                `Return $t.pos`,
            `EndFunc`,

            `Func ${this.functionName("InputStream_SetPosition")}($t, $i)`,
                `$t.pos = $i`,
                `${this.functionName("InputStream_CheckEOF")}($t)`,
            `EndFunc`,

            `Func ${this.functionName("InputStream_CheckEOF")}($t)`,
                `$t.eof = $t.pos > $t.length`,
            `EndFunc`,

            `Func ${this.functionName("InputStream_GetEOF")}($t)`,
                `Return $t.eof`,
            `EndFunc`,

            `Func ${this.functionName("InputStream_GetSubstring")}($t, $i, $j)`,
                `If $j > $t.length Then $j = $t.length`,
                `If $i > $t.length Then $i = $t.length`,
                `If $i > $j Then`,
                    `Local $tmp = $i`,
                    `$i = $j`,
                    `$j = $tmp`,
                `EndIf`,
                `If $i = $j Then Return ""`,
                `Return DllStructGetData(DllStructCreate("WCHAR input["&($j - $i)&"];", DllStructGetPtr($t, "input") + ($i - 1) * 2), 1)`,
            `EndFunc`,
        ].join("\n"));

        // Array functions
        this.parts.push([
            `Func ${this.functionName("Array")}($v1=Null,$v2=Null,$v3=Null,$v4=Null,$v5=Null,$v6=Null,$v7=Null,$v8=Null,$v9=Null,$v10=Null,$v11=Null,$v12=Null,$v13=Null,$v14=Null,$v15=Null,$v16=Null,$v17=Null,$v18=Null,$v19=Null,$v20=Null,$v21=Null,$v22=Null,$v23=Null,$v24=Null,$v25=Null,$v26=Null,$v27=Null,$v28=Null,$v29=Null,$v30=Null,$v31=Null,$v32=Null,$v33=Null,$v34=Null,$v35=Null,$v36=Null,$v37=Null,$v38=Null,$v39=Null,$v40=Null,$v41=Null,$v42=Null,$v43=Null,$v44=Null,$v45=Null,$v46=Null,$v47=Null,$v48=Null,$v49=Null,$v50=Null,$v51=Null,$v52=Null,$v53=Null,$v54=Null,$v55=Null,$v56=Null,$v57=Null,$v58=Null,$v59=Null,$v60=Null,$v61=Null,$v62=Null,$v63=Null,$v64=Null,$v65=Null,$v66=Null,$v67=Null,$v68=Null,$v69=Null,$v70=Null,$v71=Null,$v72=Null,$v73=Null,$v74=Null,$v75=Null,$v76=Null,$v77=Null,$v78=Null,$v79=Null,$v80=Null,$v81=Null,$v82=Null,$v83=Null,$v84=Null,$v85=Null,$v86=Null,$v87=Null,$v88=Null,$v89=Null,$v90=Null,$v91=Null,$v92=Null,$v93=Null,$v94=Null,$v95=Null,$v96=Null,$v97=Null,$v98=Null,$v99=Null,$v100=Null)`,
                `Local $a[@NumParams]`,
                `For $i = 1 To @NumParams`,
                    `$a[$i - 1] = Eval("v"&$i)`,
                `Next`,
                `Return $a`,
            `EndFunc`,
        ].join("\n"));

        // Parser functions
        this.parts.push([
            `Func ${this.functionName("Parser_Run")}($t, $a)`,
                `Local $s = "Call($a[0], $t"`,
                `For $i = 1 To Ubound($a) - 1`,
                    `$s &= ", $a[" & $i & "]"`,
                `Next`,
                `$s &= ")"`,
                `Local $r = Execute($s)`,
                `Return SetError(@error, @extended, $r)`,
            `EndFunc`,
            `Func ${this.functionName("Parser_OneOrMore")}($t, $v)`,
                `Local $a[16], $i = 0, $p = ${this.functionName("InputStream_GetPosition")}($t), $e = 0, $s`,
                `While 1`,
                    `$s = "Call($v[0], $t"`,
                    `For $j = 1 To Ubound($v) - 1`,
                        `$s &= ", $v[" & $j & "]"`,
                    `Next`,
                    `$s &= ")"`,
                    `$a[$i] = Execute($s)`,
                    `If @error Then`,
                        `$e = @error`,
                        `ExitLoop`,
                    `EndIf`,
                    `$i += 1`,
                    `If Ubound($a) = $i Then Redim $a[$i * 2]`,
                `WEnd`,
                `If $i = 0 Then Return SetError($e = 0 ? 1 : $e, 0, Null)`,
                `Redim $a[$i]`,
                `Return $a`,
            `EndFunc`,
            `Func ${this.functionName("Parser_Choice")}($t, $a)`,
                `Local $p = ${this.functionName("InputStream_GetPosition")}($t), $s, $a2, $r, $e = 0`,
                `For $i = 0 To Ubound($a) - 1`,
                    `$a2 = $a[$i]`,
                    `$s = "Call($a2[0], $t"`,
                    `For $j = 1 To Ubound($a2) - 1`,
                        `$s &= ", $a2[" & $j & "]"`,
                    `Next`,
                    `$s &= ")"`,
                    `$r = Execute($s)`,
                    `If @error = 0 Then`,
                        `Return $r`,
                    `EndIf`,
                    `$e = @error`,
                    `${this.functionName("InputStream_SetPosition")}($t, $p)`,
                `Next`,
                `Return SetError($e, 0, Null)`,
            `EndFunc`,
            `Func ${this.functionName("Parser_Literal")}($t, $v, $b = True)`,
                `$s = ${this.functionName("InputStream_PeekAhead")}($t, StringLen($v))`,
                `${this.functionName("InputStream_Skip")}($t, StringLen($v))`,
                `If ($b ? $s = $v : $s == $v) Then Return $s`,
                `Return SetError(1, 0, Null)`,
            `EndFunc`,
        ].join("\n"));

        // Rule functions
        ast.rules.forEach(rule => {
            this.parts.push([
                `Func ${this.functionName("peg_f" + rule.name)}($t)`,
                    `Local $p = ${this.functionName("InputStream_GetPosition")}($t)`,
                    `Local Static $aR = ${this.functionName("Array")}(${this.ast2code(rule.expression)})`,
                    `Local $r = ${this.functionName("Parser_Run")}($t, $aR)`,
                    `Local $e = @error`,
                    `Return SetError($e, $p, $r)`,
                `EndFunc`,
            ].join("\n"));
        });

        if (Array.isArray(ast.initializer)) {
            this.parts.push(ast.initializer.map(node => node.code).join("\n"));
        } else {
            if (typeof ast.initializer?.code === "string") {
                this.parts.push(ast.initializer.code);
            }
        }

        this.parts.push([
            `Func peg_parse($input, $options = Null)`,
            //`$options = @NumParams > 1 ? $options : MapCreate()`,
                `Local $t = ${this.functionName("InputStream")}($input)`,
                `Local $r = ${this.functionName("peg_f" + (options.allowedStartRules?.[0] ?? ast.rules[0].name))}($t)`,
                `Return SetError(@error, 0, $r)`,
            `EndFunc`,
        ].join("\n"));

        ast.code = new SourceNode(null, null, null, this.parts.join("\n"));
    }

    getUniqueInternalName(): string {
        return `__${this.uniqueId}_${this.counter++}`;
    }

    ast2code(ast: ast.Expression | ast.Named): string {
        switch (ast.type) {
            case "one_or_more":
                return `${this.functionName("Parser_OneOrMore")}, ${this.functionName("Array")}(${this.ast2code(ast.expression)})`;
            case "class":
                // a list or ot parts that can each be either symbol range or single symbol
                const parts = ast.parts.map(part => Array.isArray(part) ? `${this.functionName("Array")}(${part.map(part => part.charCodeAt(0)).join(",")})` : part.charCodeAt(0)).join(",");

                return `${this.functionName("Parser_Class")}, ${this.functionName("Array")}(${parts}), ${ast.ignoreCase ? "1" : "0"}, ${ast.inverted ? "1" : "0"}`;
            case "choice":
                // rules divided by "/"
                return [
                    `${this.functionName("Parser_Choice")}`,
                    [
                        `${this.functionName("Array")}(`,
                            ast.alternatives.map(alternative => `${this.functionName("Array")}(${this.ast2code(alternative)})`).join(","),
                        `)`,
                    ].join('')
                ].join(",");
            case "literal":
                return `${this.functionName("Parser_Literal")}, ${this.toAu3String(ast.value)}, ${ast.ignoreCase ? "1" : "0"}`;
            case "action":
                // FIXME: add support for ast.code Javascript transpilation to AutoIt3
                // parse ast.code with javascript parser
                // transpile javascript ast to AutoIt3 code

                const actionFunctionName = this.getUniqueInternalName();

                const indices: number[] = [];
                const parameters = (() => {
                    switch (ast.expression.type) {
                        case "sequence":
                            return ast.expression.elements.filter((expression, index) => {const isLabeled = expression.type === "labeled"; if(isLabeled) {indices.push(index);} return isLabeled}).map(expression =>  "$" + expression.label);
                        case "labeled":
                            indices.push(0);
                            return ["$" + ast.expression.label];
                        case "any":
                        case "class":
                        case "literal":
                        case "rule_ref":
                        case "group":
                        case "library_ref":
                        case "one_or_more":
                        case "optional":
                        case "repeated":
                        case "semantic_and":
                        case "semantic_not":
                        case "simple_and":
                        case "simple_not":
                        case "text":
                        case "zero_or_more":
                            return [];
                        default:
                            ast.expression satisfies never;
                            throw new Error("action parameters failed: unhandled type: " + ast.expression.type);
                    }
                })();

                this.parts.push([
                    `Func ${actionFunctionName}(${parameters.join(", ")})`,
                        `${ast.code}`,
                    `EndFunc`,
                ].join("\n"));

                
                return `${this.functionName("Parser_Action")}, ${actionFunctionName}, ${this.functionName("Array")}(${this.ast2code(ast.expression)}), ${this.functionName("Array")}(${indices.join(", ")})`;
            case "sequence":
                return `${this.functionName("Parser_Sequence")}, ${this.functionName("Array")}(${ast.elements.map(element => `${this.functionName("Array")}(${this.ast2code(element)})`).join(", ")})`;
            case "labeled":
                return `${this.functionName("Parser_Labeled")}, ${ast.label === null ? "Null" : `"${ast.label}"`}, ${this.functionName("Array")}(${this.ast2code(ast.expression)})`;
            case "rule_ref":
                return `${this.functionName("Parser_RuleRef")}, ${this.functionName("peg_f" + ast.name)}`;
            case "zero_or_more":
                return `${this.functionName("Parser_ZeroOrMore")}, ${this.functionName("Array")}(${this.ast2code(ast.expression)})`;
            case "group":
                {
                    const indices = ast.expression.type === "sequence" ? ast.expression.elements.map((element, index) => element.type === "labeled" && element.label === null ? index : null) : null;
                    return `${this.functionName("Parser_Group")}, ${this.functionName("Array")}(${this.ast2code(ast.expression)})${indices === null ? "" : `, ${this.functionName("Array") + `(${indices.filter(index => index !== null).join(", ")})`}`}`;
                }
            case "named":
                // represent a named expression. Currently only seen it used for named rules
                return `${this.functionName("Parser_Named")}, "${ast.name}", ${this.functionName("Array")}(${this.ast2code(ast.expression)})`;
            case "text":
                return `${this.functionName("Parser_Text")}, ${this.functionName("Array")}(${this.ast2code(ast.expression)})`;
            case "simple_not":
                return `${this.functionName("Parser_SimpleNot")}, ${this.functionName("Array")}(${this.ast2code(ast.expression)})`;
            case "any":
                return `${this.functionName("Parser_Any")}`;
            case "optional":
                return `${this.functionName("Parser_Optional")}, ${this.functionName("Array")}(${this.ast2code(ast.expression)})`;
            default:
                throw new Error("unhandled type: " + ast.type);
        }
    }
}
