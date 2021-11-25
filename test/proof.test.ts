import 'isomorphic-fetch';

export const SNARK_FIELD_SIZE = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")
const ZqField = require("ffjavascript").ZqField
export const Fq = new ZqField(SNARK_FIELD_SIZE)
import { genProof, verifyProof, genProof_browser } from "../src";
import { poseidon } from "circomlibjs";
import * as fs from "fs";
import * as path from "path";

describe('Proof test', () => {
    it("Should create proof", async () => {

        const preimage: bigint = Fq.random();

        const hash = poseidon([preimage]);

        const wasmFilePath: string = path.join("./zkFiles", "circuit.wasm")
        const finalZkeyPath: string = path.join("./zkFiles", "circuit_final.zkey")
        const vkeyPath = path.join("./zkFiles", "verification_key.json")
        // // grothInput: any, wasmFilePath: string, finalZkeyPath: string
        const grothInput = {
            preimage
        };

        const fullProof = await genProof(grothInput, wasmFilePath, finalZkeyPath);
        const vKey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"))
        const res = await verifyProof(vKey, fullProof);
        expect(res).toBe(true)
    });

        it("Should create proof without fs", async () => {

        const preimage: bigint = Fq.random();

        const hash = poseidon([preimage]);

        const wasmFilePath: string = 'http://localhost:5000/circuit.wasm';
        const finalZkeyPath: string = 'http://localhost:5000/circuit_final.zkey';
        const vkeyPath = 'http://localhost:5000/verification_key.json';
        // // grothInput: any, wasmFilePath: string, finalZkeyPath: string
        const grothInput = {
            preimage
        };

        const fullProof = await genProof_browser(grothInput, wasmFilePath, finalZkeyPath);

        const resp = await fetch(vkeyPath);
        const text = await resp.text();
        const vKey = JSON.parse(text)

        const res = await verifyProof(vKey, fullProof);
        expect(res).toBe(true)
    })
});


