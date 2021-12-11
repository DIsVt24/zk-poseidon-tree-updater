pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "./tree.circom";
include "./merkletreeupdater.circom";

template PoseidonTreeUpdate(n_levels) {
    var LEAVES_PER_NODE = 5;
    var LEAVES_PER_PATH_LEVEL = LEAVES_PER_NODE - 1;

    signal input identity_path_index[n_levels];
    signal input path_elements[n_levels][LEAVES_PER_PATH_LEVEL];
    signal input identity_commitment;

    signal output pre_root;
    signal output post_root;

    var i;
    var j;

    // pre-insertion
    component preInclusionProof = QuinTreeInclusionProof(n_levels);
    preInclusionProof.leaf <== 0; //empty leaf
    for (i = 0; i < n_levels; i++) {
      for (j = 0; j < LEAVES_PER_PATH_LEVEL; j++) {
        preInclusionProof.path_elements[i][j] <== path_elements[i][j];
      }
      preInclusionProof.path_index[i] <== identity_path_index[i];
    }
    pre_root <== preInclusionProof.root;

    // post-insertion
    component postInclusionProof = QuinTreeInclusionProof(n_levels);
    postInclusionProof.leaf <== identity_commitment;
    for (i = 0; i < n_levels; i++) {
      for (j = 0; j < LEAVES_PER_PATH_LEVEL; j++) {
        postInclusionProof.path_elements[i][j] <== path_elements[i][j];
      }
      postInclusionProof.path_index[i] <== identity_path_index[i];
    }
    post_root <== postInclusionProof.root;
}

component main = PoseidonTreeUpdate(10);