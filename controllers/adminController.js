const User = require("../models/userModel");

//GET USER LIST
const getUserListController = async (req, res) => {
  try {
    const userData = await User
      .find({ role: "user" })
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      Toatlcount: userData.length,
      message: "User List Fetched Successfully",
      userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In user List API",
      error,
    });
  }
};
// //GET HOSPITAL LIST
// const getHospitalListController = async (req, res) => {
//   try {
//     const hospitalData = await userModel
//       .find({ role: "hospital" })
//       .sort({ createdAt: -1 });

//     return res.status(200).send({
//       success: true,
//       Toatlcount: hospitalData.length,
//       message: "HOSPITAL List Fetched Successfully",
//       hospitalData,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "Error In Hospital List API",
//       error,
//     });
//   }
// };
// //GET ORG LIST
// const getOrgListController = async (req, res) => {
//   try {
//     const orgData = await userModel
//       .find({ role: "organisation" })
//       .sort({ createdAt: -1 });

//     return res.status(200).send({
//       success: true,
//       Toatlcount: orgData.length,
//       message: "ORG List Fetched Successfully",
//       orgData,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "Error In ORG List API",
//       error,
//     });
//   }
// };
// // =======================================

// //DELETE DONAR
// const deleteDonarController = async (req, res) => {
//   try {
//     await userModel.findByIdAndDelete(req.params.id);
//     return res.status(200).send({
//       success: true,
//       message: " Record Deleted successfully",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "Error while deleting ",
//       error,
//     });
//   }
// };

//EXPORT
module.exports = {
    getUserListController
};

