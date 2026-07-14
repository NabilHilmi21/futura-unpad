import Location from "../ui/location"
export default function LocationSection() {
    return (
        <section className="flex flex-col space-y-8 mx-auto min-h-[calc(100svh-65px)] flex justify-center items-center px-5 py-20 sm:px-8 lg:py-28 z-10">
            <Location
                id="lokasi"
                location="Aula Graha Sanusi Hardjadinata, Universitas Padjadjaran"
                address="Jl. Dipati Ukur No.35, Lebakgede, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132"
                mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9848904239084!2d107.6144918749962!3d-6.8924101931067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6ff3218aacd%3A0xce249fca022b09c4!2sGraha%20Sanusi%20Hardjadinata!5e0!3m2!1sen!2sid!4v1783634649226!5m2!1sen!2sid"
            />
        </section>
    )
}