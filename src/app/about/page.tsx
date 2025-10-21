"use client";

export default function AboutPage() {
  return (
    <div className="bg-[#F5F5DC] min-h-screen py-10 px-4 md:px-8 lg:px-16">
      <h1 className="text-3xl font-bold text-[#1E392A] mb-6 text-center">
        About MASH
      </h1>
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <p className="text-lg text-gray-700 mb-4">
          <strong>MASH</strong> (Mushroom Automation Shop) is a modern
          e-commerce platform dedicated to connecting mushroom growers and
          enthusiasts across the Philippines. Our mission is to make fresh,
          organic, and specialty mushrooms accessible to everyone, while
          supporting local farmers and sustainable agriculture.
        </p>
        <p className="text-gray-700 mb-4">
          We offer a curated selection of oyster mushrooms, shiitake, and unique
          mushroom products, sourced directly from trusted growers. Whether
          you&apos;re a home cook, restaurant owner, or health-conscious shopper,
          MASH provides quality, convenience, and transparency in every order.
        </p>
        <p className="text-gray-700 mb-4">
          <strong>Why choose MASH?</strong>
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>Fresh and organic mushrooms delivered to your door</li>
          <li>Support for local growers and sustainable farming</li>
          <li>Easy online ordering and secure payment options</li>
          <li>Community-driven platform with recipes, tips, and more</li>
        </ul>
        <p className="text-gray-700">
          Join us in growing the mushroom movement!
        </p>
      </div>
    </div>
  );
}
