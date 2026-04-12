type NewsArticleBodyProps = {
  body: string[];
};

export default function NewsArticleBody({ body }: NewsArticleBodyProps) {
  return (
    <section className="py-12">
      <div className="flex flex-col gap-7">
        {body.map((paragraph, index) => (
          <p
            key={index}
            className="whitespace-pre-line font-body-01 leading-loose text-gray-700"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
