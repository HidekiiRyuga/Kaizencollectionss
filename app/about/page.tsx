import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <main className="mx-auto max-w-[1500px] px-8 py-20 lg:px-12 lg:py-28 xl:px-16">
        <section className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E1ACB0]">
            About KaizenCollectionss
          </p>

          <h1 className="mt-5 text-5xl font-bold tracking-tight text-[#302324] sm:text-6xl lg:text-7xl">
            Made for people who love
            <span className="block">the little things.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#7A6B6D]">
            KaizenCollectionss is a small collection of anime-inspired
            finds, cute accessories, and unique pieces made for people
            who enjoy adding a little personality to their everyday
            lives.
          </p>
        </section>

        <section className="mt-24 grid gap-12 border-t border-[#E7DDDD] pt-12 md:grid-cols-3 md:gap-16">
          <div>
            <h2 className="text-xl font-semibold text-[#302324]">
              What we love
            </h2>

            <p className="mt-4 leading-7 text-[#7A6B6D]">
              Anime, cute collectibles, creative designs, and things
              that simply make you smile.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#302324]">
              What we offer
            </h2>

            <p className="mt-4 leading-7 text-[#7A6B6D]">
              Carefully selected products that bring a little more
              character to your everyday collection.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#302324]">
              Why Kaizen
            </h2>

            <p className="mt-4 leading-7 text-[#7A6B6D]">
              We believe in getting a little better with every
              collection, one product at a time.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}