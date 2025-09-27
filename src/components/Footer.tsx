import logo from "../public/AloIonLogo.png"

const Footer = () => {
    return (
        <div className="w-full h-[200px] font-[bolder] flex justify-center items-center gap-5 text-[30px] border border-top border-[1px] border-[black]">
            <img src={logo} alt="" height={100} width={100} className="rounded-full" />
            <h1>প্রযুক্তি সহযোগিতায় - <a href="https://facebook.com/aloion.official" className="text-[#A00100] font-[700] hover:text-[black] underline">আলোআয়ন</a></h1>
        </div>
    )
}

export default Footer;