type Chord = {Chord: string};
type Label = {Label: string};
type Text = {Text: string};
export type TextNode = 'Newline' | Chord | Label | Text;

type Props = {
    chords: TextNode[]
}

export const ChordsPreview = ({chords}: Props) => {
    const lines = chords.reduce((acc, node) => {
        if (node != 'Newline') {
            acc[acc.length - 1].push(node);
        } else {
            acc.push([]);
        }

        return acc
    }, [[]] as TextNode[][]);

    return (
        <div className="chords-preview-container">
            {lines.map(line => (
                <div className="line-container">
                    {line.map(node => {
                        if ((node as Chord).Chord != undefined) {
                            return <sup><b>{(node as Chord).Chord}</b></sup>
                        } else if ((node as Label).Label != undefined) {
                            return <b>{(node as Label).Label}</b>
                        } else if ((node as Text).Text != undefined) {
                            return <>{(node as Text).Text}</>
                        }
                    })}
                </div>
            ))}
        </div>
    )
}