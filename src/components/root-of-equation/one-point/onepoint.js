/* eslint-disable use-isnan */
import React, { useEffect, useState } from "react";
import Desmos from 'desmos'
import './onepoint.css'

import { create, all } from 'mathjs'
import { addStyles, EditableMathField } from 'react-mathquill' //eq input
import axios from "axios" //ดึง API (volley)
addStyles()//eq input

const config = { }
const math = create(all, config)
const Onepoint = () => {
    let dataTable = []
    const [data, setData] = useState({
        x:0,
        check: false,
        result:0
    })

    const [Fxtext, setFxtext] = useState({
        Title: "Onepoint",
        Fx: "",
        Latex: ""
    })

    const [table,setTable] = useState("")

    const handleChange = ({currentTarget: input }) =>{
        setData({ ...data, [input.name]:input.value})
    }
    let calculator = null
    const handleSubmit = async(e) => {
        e.preventDefault()
        
        let resultFx = Fxtext.Fx

        setData({
            x:data.x,
            check:true,
            result:0
        })
        const parseFx = math.parse(resultFx)
        const onepointCompile = parseFx.compile()
        console.log(onepointCompile)
        let scope = {x:0}
        let x=Number(data.x)
        let y = 0.000001
        let i=0
        
        while(true){
            let oldx = x

            scope.x = x
            x = onepointCompile.evaluate(scope)
           
            let ab = Math.abs((x - oldx) / x)
            console.log(ab)
            if(isNaN(ab)){
                break
            }
            if(ab <= y && ab >= -y) {
                console.log("ab = ",ab)
                console.log("x = " ,x)
                if(i===0){
                    dataTable.push({
                        xo: oldx.toFixed(6),
                        xn: x.toFixed(6),
                        epsilon: '-'
                    })
                }
                else{
                    dataTable.push({
                        xo: oldx.toFixed(6),
                        xn: x.toFixed(6),
                        epsilon: ab.toFixed(6)
                    })
                }
                setData({
                    x:data.x,
                    check:true,
                    result:x.toFixed(6)
                })
                scope.x = x
                let sum = onepointCompile.evaluate(scope)
                graph(x.toFixed(6),Number(sum.toFixed(3))-Number(x.toFixed(3)))
                break
            }
            else{
                if(i===0){
                    dataTable.push({
                        xo: oldx.toFixed(6),
                        xn: x.toFixed(6),
                        epsilon: '-'
                    })
                }
                else{
                    dataTable.push({
                        xo: oldx.toFixed(6),
                        xn: x.toFixed(6),
                        epsilon: ab.toFixed(6)
                    })
                }
                console.log("ab = ",ab)
                console.log("x = " ,x)
                console.log("round = " ,i++)
            }
        }
        const resdata = ({
            Title: "Onepoint",
            Fx: resultFx,
            Latex: Fxtext.Latex
        })
        console.log(resdata.Fx, resdata.Latex)

        console.log(resdata)
        try {
            const url = "http://localhost:4000/api/rootofeq/savefx"
            const { data: res } = await axios.post(url, resdata)
            console.log(res)

        } catch (error) {
            if (
                error.response.status >= 400 &&
                error.response.status <= 500
            ) console.log(error.response.data)
        }
        createTable()
    }
    const createTable  = () =>{
        setTable(<table className="table">
            <thead className="table-dark">
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">X_old</th>
                    <th scope="col">X</th>
                    <th scope="col">epsilon</th>
                </tr>
            </thead>
            <tbody>
                {dataTable.map((data,i) => {
                    return (
                        <tr>
                            <td>{i+1}</td>
                            <td>{data.xo}</td>
                            <td>{data.xn}</td>
                            <td>{data.epsilon}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>)
    }
    
    const graph = (sum,y) => {
        const elt = document.getElementById('calculatorgraph')
        elt.innerHTML = ''
        calculator = Desmos.GraphingCalculator(elt)
        const fx = 'y=' + Fxtext.Latex + '-x'
        calculator.setExpression({ id: 'graph1', latex: fx })
        calculator.setExpression({ id: 'graph2', latex: '(' + sum + ',' + y + ')' })
    }

    useEffect(() => {
        AuthToken()
    }, [])

    const AuthToken = async () => {
        try {
            const data_token = localStorage.getItem("data_token")
            console.log(data_token)
            const url = "http://localhost:4000/api/rootofeq/auth_datatoken"
            const { data: res } = await axios.post(url, { token: data_token })
            console.log(res)
            setFxtext({
                Title: res.token.Title,
                Fx: res.token.Fx,
                Latex: res.token.Latex
            })
        } catch (error) {
            if(
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ){
                localStorage.removeItem("data_token")
                console.log("EXP")
                console.log(error.response.data)
            }
        }
    
    }

    const handleRandom = async (e) => {
        e.preventDefault()
        try {
            const url = "http://localhost:4000/api/rootofeq/randomfx/Onepoint"
            const { data: res } = await axios.get(url, Fxtext)
            console.log(res)
            localStorage.setItem("data_token", res.token)
            // AuthToken()
            setFxtext({
                Title: res.data.Title,
                Fx: res.data.Fx,
                Latex: res.data.Latex
            })
        } catch (error) {
            if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ) {
                console.log(error.response.data)
            }
        }
    }
    

    return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="w-50">
                        <form onSubmit={handleSubmit}>
                        <div className="w-50 ">
                            <div className="col-auto">
                                <label className="col-form-label m-auto">F(x)</label>
                            </div>
                            <div className="calcu">
                                <EditableMathField
                                    className="mathquill-example-field MathField-class w-75 p-2  border border-dark"
                                    latex={Fxtext.Latex}
                                    onChange={(mathField) => {
                                        setFxtext({
                                            Fx: mathField.text(),
                                            Latex: mathField.latex()
                                        })
                                    }}
                                    mathquillDidMount={(mathField) => {
                                        setFxtext({
                                            Fx: mathField.text(),
                                            Latex: mathField.latex()
                                        })
                                    }}
                                    style={{border: "0px", margin: "auto"}}
                                />
                                <button type="button" onClick={handleRandom} className="btn btn-success mt-3">Random</button>
                            </div>
                        </div>
                        <div className="w-50 ">
                            <div className="col-auto">
                                <label className="col-form-label m-auto">X</label>
                            </div>
                            <div className="col-auto">
                                <input className="form-control" onChange={handleChange} value={data.x} name="x" placeholder="กรอกค่า X"/>
                            </div>
                        </div>
                        <div className="w-50 ">
                            <div className="col-auto">
                                <button type="submit" className="btn btn-success mt-3">Success</button>
                                <h1 className="mt-3">X = {data.result} </h1>
                            </div>
                        </div>
                    </form>
                    </div>
                    <div className="col w-25 ">
                        <div id="calculatorgraph" className="graph "></div><br />
                    </div>   
                </div>
            </div>
            
            <div className="container">
                <div className="row">  
                    <div className="col w-25 ">
                        {table}
                    </div> 
                </div>        
            </div>      
        </div>
    )
}

export default Onepoint