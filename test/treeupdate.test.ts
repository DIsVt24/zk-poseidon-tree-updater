import 'isomorphic-fetch';

const { Semaphore, generateMerkleProof, genExternalNullifier, genSignalHash } = require("@libsem/protocols");
const { ZkIdentity } = require("@libsem/identity");
import { MerkleProof } from "@libsem/types"

export const SNARK_FIELD_SIZE = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617")
const ZqField = require("ffjavascript").ZqField
export const Fq = new ZqField(SNARK_FIELD_SIZE)
import { genProof, verifyProof } from "../src";
import * as fs from "fs";
import * as path from "path";

let semaphore;
let defaultExternalNullifier;
const identityCommitments = [];
const ZERO_VALUE = BigInt(0)


describe('Proof test', () => {
    it("Should create proof", async () => {

        const identity = new ZkIdentity();
        const id_comm = identity.genIdentityCommitment();

        const signal = "0x111";

        const commitments = Object.assign([ZERO_VALUE], identityCommitments)
        const premerkleProof: MerkleProof = generateMerkleProof(10, ZERO_VALUE, 5, commitments, ZERO_VALUE)

        commitments.push(id_comm)
        const merkleProof: MerkleProof = generateMerkleProof(10, ZERO_VALUE, 5, commitments, id_comm)

        const identity_path_index = [merkleProof.indices, merkleProof.indices]
        const path_elements = [merkleProof.pathElements, merkleProof.pathElements]
        const identity_commitment = [id_comm, id_comm]
        const pre_root = premerkleProof.root
        const post_root = merkleProof.root
        
        const grothInput = {
            identity_path_index,
            path_elements,
            identity_commitment,
        };

        const wasmFilePath: string = path.join("./zkFiles", "circuit.wasm")
        const finalZkeyPath: string = path.join("./zkFiles", "circuit_final.zkey")
        const vkeyPath = path.join("./zkFiles", "verification_key.json")
        
        const fullProof = await genProof(grothInput, wasmFilePath, finalZkeyPath);
        fullProof.publicSignals = [pre_root, post_root, pre_root, post_root]
        const vKey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"))
        const res = await verifyProof(vKey, fullProof);
        expect(res).toBe(true)
    });
});


