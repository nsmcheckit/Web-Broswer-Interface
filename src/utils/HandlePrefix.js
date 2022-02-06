// AM_Hero301_Atk_BranchAttack_00 => Hero301_Atk_BranchAttack_00
export const handlePrefix = (texture) => {
  const splitArray = texture.split("_");
  splitArray.shift();
  return splitArray.join("_");
};