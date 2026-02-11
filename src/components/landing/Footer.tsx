const Footer = () => {
    return (
        <footer className="bg-gray-900/50 backdrop-blur-sm border-t border-white/10 mt-20">
            <div className="container max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Aloqa</h3>
                        <div className="space-y-2">
                            <p className="text-gray-400 text-sm">
                                Savollar uchun: <span className="text-white">info@jobx.uz</span>
                            </p>
                            <p className="text-gray-400 text-sm">
                                Hamkorlik: <span className="text-white">partner@jobx.uz</span>
                            </p>
                            <p className="text-gray-400 text-sm">
                                Texnik yordam: <span className="text-white">support@jobx.uz</span>
                            </p>
                        </div>
                    </div>

                    {/* Careers */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Karyera</h3>
                        <p className="text-gray-400 text-sm">
                            Bizning jamoaga qo‘shiling:{" "}
                            <span className="text-white">careers@jobx.uz</span>
                        </p>
                    </div>

                    {/* Address */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Manzil</h3>
                        <div className="text-gray-400 text-sm">
                            <p className="text-white">Toshkent, O‘zbekiston</p>
                            <p className="text-white">Mustaqillik shoh ko‘chasi, 12A</p>
                        </div>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Ijtimoiy tarmoqlar</h3>
                        <div className="space-y-2">
                            <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Telegram
                            </a>
                            <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                LinkedIn
                            </a>
                            <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                                Instagram
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-white/10">
                    <p className="text-gray-400 text-sm mb-4 md:mb-0">
                        © {new Date().getFullYear()} JOB X. Barcha huquqlar himoyalangan.
                    </p>

                    <div className="flex items-center space-x-2">
                        {/* <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-cyan-600 rounded-sm"></div>
                        </div> */}
                        <span className="text-white font-semibold text-lg">JOB X</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
